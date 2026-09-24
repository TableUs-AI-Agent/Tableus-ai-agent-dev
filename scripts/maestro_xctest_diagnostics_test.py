"""Synthetic filesystem/process fixtures for the local XCTest supervisor."""
import datetime as dt
import hashlib
import json
import signal
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0,str(Path(__file__).resolve().parent))
import maestro_xctest_diagnostics as m

DEVICE = '0EFFA766-DCDD-49E5-84B0-D3593B68709A'


class DiagnosticsTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.flow = self.base/'create-failure.yml'
        self.flow.write_text('appId: com.tableus.app\n')
        self.root = self.base/'flow-01'
        self.root.mkdir(mode=0o700)
        (self.root/'tmp').mkdir()
        (self.root/'debug-output').mkdir()
        self.started = dt.datetime.now(dt.timezone.utc)-dt.timedelta(seconds=10)
        self.invocation = {'schema_version':1,'device_id':DEVICE,'started_at':self.started.isoformat(),
                           'flow_path':str(self.flow),'flow_sha256':hashlib.sha256(self.flow.read_bytes()).hexdigest(),
                           'root':str(self.root),'tmp_root':str(self.root/'tmp'),
                           'debug_root':str(self.root/'debug-output')}
        self.save_invocation()
        m._LATCHED.clear()

    def save_invocation(self):
        (self.root/'operator-invocation.json').write_text(json.dumps(self.invocation))

    def log(self, name='scheduling.log', body='healthy startup pending'):
        path=self.root/'tmp/maestro_xctestrunner_xcodebuild_output001/Logs/Test/X.xcresult/Staging/1_Test/Diagnostics'/name
        path.parent.mkdir(parents=True,exist_ok=True)
        path.write_text(body)
        return path

    def debug_log(self, relative, body='healthy XCTest output'):
        path=self.root/'debug-output'/relative
        path.parent.mkdir(parents=True,exist_ok=True)
        path.write_text(body)
        return path

    def process(self, pid=88, device=DEVICE, output=None, older=False, ppid=1):
        output=output or self.root/'tmp/maestro_xctestrunner_xcodebuild_output001/Logs/Test/X.xcresult/Staging/1_Test/Diagnostics/simctl_diagnostics'
        started=self.started-dt.timedelta(seconds=10) if older else self.started+dt.timedelta(seconds=2)
        local=started.astimezone().strftime('%a %b %d %H:%M:%S %Y')
        args=f'{m.SIMCTL} diagnose -l -b --output={output} --no-archive --udid={device}'
        line=f'{pid} {ppid} 77 {local} {args}\n'
        return m.parse_process_rows(line)[0]

    def test_retained_xctest_signature_latches_without_claiming_pass(self):
        path=self.log(body='2026-09-23 07:02:37 +0000: Test crashed with signal kill before establishing connection.')
        first=m.observe_invocation(self.root)
        self.assertEqual(first['state'],'startup_failure_latched')
        self.assertFalse(first['acceptance'])
        retained=self.root/first['logs'][0]['retained_path']
        self.assertIn(m.FAILURES[0],retained.read_text())
        path.write_text('')
        self.assertEqual(m.observe_invocation(self.root)['state'],'startup_failure_latched')
        self.assertIn(m.FAILURES[0],retained.read_text())
        path.unlink()
        again=m.observe_invocation(self.root)
        self.assertEqual(again['state'],'startup_failure_latched')
        self.assertEqual(first['failure'],again['failure'])
        m._LATCHED.clear()
        self.assertEqual(m.observe_invocation(self.root)['state'],'startup_failure_latched')
        self.assertTrue((self.root/'xctest-observation.json').is_file())
        self.assertTrue(retained.is_file())

    def test_healthy_and_missing_logs_never_pass(self):
        self.assertEqual(m.observe_invocation(self.root)['state'],'pending_no_recognized_logs')
        self.log(body='Session started, no failure yet')
        state=m.observe_invocation(self.root)
        self.assertEqual(state['state'],'no_startup_failure_observed')
        self.assertFalse(state['acceptance'])

    def test_pinned_maestro_debug_layout_is_observed_without_ui_acceptance(self):
        runner=self.debug_log('xctest_runner_2026-09-23_232204.log',
                              'Test Suite maestro-driver-iosUITests.xctest started')
        device=self.debug_log('create-failure/logs/device-xctest.log',
                              'XCTest bootstrap still in progress')
        state=m.observe_invocation(self.root)
        self.assertEqual(state['state'],'no_startup_failure_observed')
        self.assertEqual(state['recognized_log_count'],2)
        self.assertFalse(state['acceptance'])
        self.assertEqual({x['path'] for x in state['logs']},
                         {str(runner.relative_to(self.root)),str(device.relative_to(self.root))})
        for entry in state['logs']:
            self.assertEqual((self.root/entry['retained_path']).read_bytes(),
                             (self.root/entry['path']).read_bytes())
        device.write_text(m.FAILURES[0])
        failed=m.observe_invocation(self.root)
        self.assertEqual(failed['state'],'startup_failure_latched')
        self.assertFalse(failed['acceptance'])
        device.unlink()
        self.assertEqual(m.observe_invocation(self.root)['state'],'startup_failure_latched')

    def test_pinned_runner_log_failure_and_nearby_unowned_names(self):
        self.debug_log('xctest_runner_2026-09-23_232204.log',m.FAILURES[1])
        state=m.observe_invocation(self.root)
        self.assertEqual(state['state'],'startup_failure_latched')
        self.assertEqual(state['failure']['markers'][0]['signature'],m.FAILURES[1])

    def test_nearby_debug_names_and_other_flow_layout_are_not_accepted(self):
        for relative in ('xctest_runner_latest.log','nested/xctest_runner_2026-09-23_232204.log',
                         'other-flow/logs/device-xctest.log','create-failure/other/device-xctest.log',
                         'create-failure/logs/device-xctest.log.old','maestro.log'):
            self.debug_log(relative,m.FAILURES[0])
        state=m.observe_invocation(self.root)
        self.assertEqual(state['state'],'pending_no_recognized_logs')
        self.assertEqual(state['recognized_log_count'],0)
        self.assertFalse(state['acceptance'])

    def test_partial_marker_does_not_pass_or_latch_then_second_signature_does(self):
        path=self.log(name='Session-startup.log',body='Test crashed with signal')
        self.assertEqual(m.observe_invocation(self.root)['state'],'no_startup_failure_observed')
        path.write_text('Early unexpected exit, operation never finished bootstrapping')
        self.assertEqual(m.observe_invocation(self.root)['state'],'startup_failure_latched')

    def test_unsafe_registration_and_symlinks_fail_closed(self):
        self.invocation['device_id']='11111111-1111-1111-1111-111111111111';self.save_invocation()
        reg=m.registration(self.root)
        self.assertEqual(reg['device_id'],'11111111-1111-1111-1111-111111111111')  # Caller binds expected UUID.
        self.invocation['device_id']=DEVICE
        self.invocation['root']=str(self.base/'other');self.save_invocation()
        with self.assertRaises(m.EvidenceError):m.registration(self.root)
        self.invocation['root']=str(self.root);self.save_invocation()
        (self.root/'debug-output').rmdir()
        (self.root/'debug-output').symlink_to(self.base,target_is_directory=True)
        with self.assertRaises(m.EvidenceError):m.observe_invocation(self.root)

    def test_failed_evidence_write_prevents_observation(self):
        self.log(body=m.FAILURES[0])
        with patch.object(m,'_write_private',side_effect=OSError('disk full')):
            with self.assertRaises(OSError):m.observe_invocation(self.root)
        with patch.object(m,'_snapshot_log',side_effect=OSError('snapshot failed')):
            with self.assertRaises(OSError):m.observe_invocation(self.root)

    def test_oversized_log_and_foreign_observation_fail_closed(self):
        self.log(body='x'*(m.MAX_LOG_BYTES+1))
        with self.assertRaises(m.EvidenceError):m.observe_invocation(self.root)

    def test_accumulated_snapshot_budget_fails_closed(self):
        reg=m.registration(self.root)
        with patch.object(m,'MAX_SNAPSHOT_BYTES',5):
            m._snapshot_log(reg,b'12345')
            with self.assertRaises(m.EvidenceError):m._snapshot_log(reg,b'new')
        with patch.object(m,'MAX_SNAPSHOTS',1):
            with self.assertRaises(m.EvidenceError):m._snapshot_log(reg,b'other')
        (self.root/'xctest-observation.json').write_text(json.dumps({
            'device_id':'11111111-1111-1111-1111-111111111111',
            'registered_flow_sha256':self.invocation['flow_sha256']}))
        with self.assertRaises(m.EvidenceError):m.observe_invocation(self.root)
        (self.root/'xctest-observation.json').write_text(json.dumps({
            'device_id':DEVICE,'registered_flow_sha256':self.invocation['flow_sha256'],
            'invocation_started_at':'2000-01-01T00:00:00+00:00'}))
        with self.assertRaises(m.EvidenceError):m.observe_invocation(self.root)

    def test_process_selection_reparenting_and_exclusions(self):
        reg=m.registration(self.root)
        owned=self.process(ppid=1)
        selection=m.select_owned_collectors([owned,self.process(pid=89,device='wrong'),
            self.process(pid=90,older=True),self.process(pid=91,output=self.base/'outside/simctl_diagnostics')],[reg])
        self.assertEqual([item['pid'] for item in selection['owned']],[88])
        self.assertEqual(selection['owned'][0]['ppid'],1)
        self.assertTrue(any('predates' in item['reason'] for item in selection['ambiguous']))
        duplicate=m.select_owned_collectors([owned,owned],[reg])
        self.assertEqual(duplicate['owned'],[])
        self.assertEqual(duplicate['ambiguous'][0]['reason'],'duplicate_pid_rows')
        fake={**owned,'pid':92,'argv':owned['argv'].replace(m.SIMCTL,'/tmp/fake/simctl')}
        self.assertEqual(m.select_owned_collectors([fake],[reg])['owned'],[])
        target=self.root/'tmp/maestro_xctestrunner_xcodebuild_output001/Logs/Test/X.xcresult/Staging/1_Test/Diagnostics/simctl_diagnostics'
        target.parent.mkdir(parents=True)
        target.symlink_to(self.base/'outside',target_is_directory=True)
        unsafe=m.select_owned_collectors([self.process(pid=93)],[reg])
        self.assertEqual(unsafe['owned'],[])
        self.assertIn('symlink',unsafe['ambiguous'][0]['reason'])

    def test_cleanup_revalidates_pid_and_never_signals_reuse(self):
        reg=m.registration(self.root);initial=self.process()
        sent=[]
        changed={**initial,'lstart':'Tue Jan 01 00:00:00 2000'}
        outcome=m.cleanup_collectors([initial],[reg],read_rows=lambda timeout:[changed],
             send_signal=lambda pid,sig:sent.append((pid,sig)),monotonic=lambda:0,sleep=lambda _:None,deadline=10)
        self.assertEqual(sent,[])
        self.assertFalse(outcome['cleanup_complete'])
        self.assertEqual(outcome['pending'][0]['reason'],'identity_changed_or_unavailable')

    def test_owned_collector_exact_signal_and_deadline(self):
        reg=m.registration(self.root);initial=self.process(ppid=42);sent=[];reads=0
        def read_rows(timeout):
            nonlocal reads
            reads+=1
            return [{**initial,'ppid':1}] if reads == 1 else []
        outcome=m.cleanup_collectors([initial],[reg],read_rows=read_rows,
            send_signal=lambda pid,sig:sent.append((pid,sig)),monotonic=lambda:0,sleep=lambda _:None,deadline=10)
        self.assertEqual(sent,[(88,signal.SIGTERM)])
        self.assertTrue(outcome['cleanup_complete'])
        self.assertTrue((self.root/'xctest-collector-cleanup.json').is_file())
        sent.clear()
        timeout=m.cleanup_collectors([initial],[reg],read_rows=read_rows,
            send_signal=lambda pid,sig:sent.append((pid,sig)),monotonic=lambda:10,sleep=lambda _:None,deadline=10)
        self.assertFalse(timeout['cleanup_complete']);self.assertEqual(sent,[])

    def test_late_process_snapshot_cannot_authorize_signal(self):
        reg=m.registration(self.root);initial=self.process();sent=[]
        ticks=iter((0,0,11))
        outcome=m.cleanup_collectors([initial],[reg],read_rows=lambda timeout:[initial],
            send_signal=lambda pid,sig:sent.append((pid,sig)),monotonic=lambda:next(ticks),
            sleep=lambda _:None,deadline=10)
        self.assertEqual(sent,[])
        self.assertFalse(outcome['cleanup_complete'])
        self.assertEqual(outcome['pending'][0]['reason'],'deadline_after_process_check')

    def test_slow_evidence_write_cannot_authorize_late_signal(self):
        reg=m.registration(self.root);initial=self.process();sent=[];now=[0]
        def slow_write(*_):now[0]=11
        with patch.object(m,'_write_private',side_effect=slow_write):
            outcome=m.cleanup_collectors([initial],[reg],read_rows=lambda timeout:[initial],
                send_signal=lambda pid,sig:sent.append((pid,sig)),monotonic=lambda:now[0],
                sleep=lambda _:None,deadline=10)
        self.assertEqual(sent,[])
        self.assertFalse(outcome['cleanup_complete'])
        self.assertEqual(outcome['pending'][0]['reason'],'deadline_after_evidence_write')

    def test_cleanup_evidence_failure_prevents_signal_and_interruption(self):
        reg=m.registration(self.root);initial=self.process();sent=[]
        with patch.object(m,'_write_private',side_effect=OSError('disk full')):
            with self.assertRaises(OSError):m.cleanup_collectors([initial],[reg],read_rows=lambda timeout:[initial],
                send_signal=lambda pid,sig:sent.append((pid,sig)),monotonic=lambda:0,sleep=lambda _:None,deadline=10)
        self.assertEqual(sent,[])
        stopped=m.cleanup_collectors([initial],[reg],read_rows=lambda timeout:[initial],
            send_signal=lambda pid,sig:sent.append((pid,sig)),monotonic=lambda:0,sleep=lambda _:None,
            deadline=10,interrupted=lambda:True)
        self.assertFalse(stopped['cleanup_complete']);self.assertEqual(sent,[])


if __name__=='__main__':unittest.main()
