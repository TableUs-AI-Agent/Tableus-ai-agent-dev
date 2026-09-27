"""Pure command/XCTest fixtures for the Settings evidence aid."""
import datetime as dt
import unittest

from scripts.maestro_ui_evidence import assess_settings_evidence as assess

T = int(dt.datetime(2026,9,23,23,22,51,tzinfo=dt.timezone(dt.timedelta(hours=-5))).timestamp()*1000)


def item(name, payload, stamp, duration=10, status='COMPLETED'):
    return {'command':{name:payload},'metadata':{'timestamp':stamp,'duration':duration,'status':status}}


def commands(launch=True):
    result=[item('applyConfigurationCommand',{'config':{'appId':'com.apple.Preferences'}},T-2000)]
    if launch:result.append(item('launchAppCommand',{'appId':'com.apple.Preferences','clearState':False},T-1000,300))
    result.extend((item('assertConditionCommand',{'condition':{'visible':{'textRegex':'Settings'}},'timeout':'5000'},T,1000),
                   item('takeScreenshotCommand',{'path':'settings-probe-1'},T+1001,100)))
    return result


def line(clock,phase,app):
    return f'2026-09-23 23:22:{clock}-0500 runner [pid] [{phase}] View hierarchy snapshot for Application \'{app}\''


class EvidenceTests(unittest.TestCase):
    def test_springboard_only_is_insufficient_not_failed_launch(self):
        log='\n'.join((line('51.100000','Start','com.apple.springboard'),
                       line('51.300000','Done','com.apple.springboard')))
        result=assess(commands(),log)
        self.assertEqual(result['disposition'],'insufficient_evidence')
        self.assertFalse(result['acceptance'])
        self.assertIn('does not prove launch',result['reasons'][0])

    def test_preferences_pair_requires_visual_review_with_lines(self):
        log='\n'.join((line('51.100000','Start','com.apple.Preferences'),
                       line('51.300000','Done','com.apple.Preferences')))
        for launch in (True,False):
            with self.subTest(launch=launch):
                result=assess(commands(launch),log)
                self.assertEqual(result['disposition'],'requires_visual_review')
                self.assertFalse(result['acceptance'])
                self.assertEqual(result['preferences_snapshot']['start_line'],1)
                self.assertEqual(result['preferences_snapshot']['done_line'],2)

    def test_stale_unrelated_and_incomplete_pairs_are_insufficient(self):
        logs=[line('49.100000','Start','com.apple.Preferences')+'\n'+line('49.300000','Done','com.apple.Preferences'),
              line('50.900000','Start','com.apple.Preferences')+'\n'+line('51.300000','Done','com.apple.Preferences'),
              line('51.100000','Start','com.other')+'\n'+line('51.300000','Done','com.other'),
              line('51.100000','Start','com.apple.Preferences')]
        for log in logs:
            with self.subTest(log=log):self.assertEqual(assess(commands(),log)['disposition'],'insufficient_evidence')

    def test_malformed_command_or_timestamp_is_invalid(self):
        bad=commands();bad[2]['metadata']['timestamp']='wrong'
        self.assertEqual(assess(bad,'')['disposition'],'invalid_evidence')
        bad=commands();bad[2]['metadata']['timestamp']=T-3000
        self.assertEqual(assess(bad,'')['disposition'],'invalid_evidence')
        log=line('51.100000','Start','com.apple.Preferences')+'\n'+line('50.100000','Done','com.apple.Preferences')
        self.assertEqual(assess(commands(),log)['disposition'],'invalid_evidence')
        bad=commands();bad[2]['command']['assertConditionCommand']['condition']='broken'
        self.assertEqual(assess(bad,'')['disposition'],'invalid_evidence')
        self.assertEqual(assess(commands(),"wrong timestamp [Start] View hierarchy snapshot for Application 'com.apple.Preferences'")['disposition'],'invalid_evidence')

    def test_failed_command_and_wrong_assertion_never_advance(self):
        bad=commands();bad[2]['metadata']['status']='FAILED'
        self.assertEqual(assess(bad,'')['disposition'],'failed_command')
        bad=commands();bad[2]['command']['assertConditionCommand']['condition']['visible']['textRegex']='Home'
        self.assertEqual(assess(bad,'')['disposition'],'insufficient_evidence')

    def test_exact_sequence_rejects_extra_config_and_late_launch(self):
        extra=commands();extra.insert(1,item('applyConfigurationCommand',{'config':{'appId':'com.apple.Preferences'}},T-1500))
        self.assertEqual(assess(extra,'')['disposition'],'invalid_evidence')
        late=commands();launch=late.pop(1);launch['metadata']['timestamp']=T+1001
        late.insert(2,launch)
        late[3]['metadata']['timestamp']=T+1400
        self.assertEqual(assess(late,'')['disposition'],'invalid_evidence')
        overlap=commands();overlap[1]['metadata']['duration']=2000
        self.assertEqual(assess(overlap,'')['disposition'],'invalid_evidence')

    def test_bounds(self):
        self.assertEqual(assess(commands()*30,'')['disposition'],'invalid_evidence')
        self.assertEqual(assess(commands(),'x'*(2*1024*1024+1))['disposition'],'invalid_evidence')


if __name__=='__main__': unittest.main()
