"""Pure simulator target-binding fixtures; never invoke a native command."""
import unittest

from scripts import simulator_target_binding as b

UUID='0EFFA766-DCDD-49E5-84B0-D3593B68709A'
ROOT='/Library/Developer/CoreSimulator/Volumes/iOS_24A434/Library/Developer/CoreSimulator/Profiles/Runtimes/iOS 27.0.simruntime/Contents/Resources/RuntimeRoot'


def row(pid,ppid,comm,lstart='Thu Sep 24 00:00:00 2026'):
    return {'pid':pid,'ppid':ppid,'lstart':lstart,'comm':comm}


class BindingTests(unittest.TestCase):
    def setUp(self):
        self.before=[row(20,1,'launchd_sim'),row(21,20,ROOT+b.SPRINGBOARD_SUFFIX)]
        self.after=[*self.before,row(91,20,ROOT+b.PREFERENCES_SUFFIX),
                    row(40,1,'launchd_sim'),row(41,40,ROOT+b.SPRINGBOARD_SUFFIX)]
        self.record={'command':['xcrun','simctl','launch',UUID,b.APP],
                     'exit_code':0,'timed_out':False,'error':None,'elapsed_seconds':9.4,
                     'settings_pid':91,'stdout':f'{b.APP}: 91\n'}

    def bind(self,before=None,after=None,record=None,uuid=UUID,root=ROOT):
        return b.bind_from_target_launch(self.before if before is None else before,
                                         self.after if after is None else after,
                                         self.record if record is None else record,uuid,root)

    def test_exact_target_seed_ignores_other_simulator_and_rechecks(self):
        bound=self.bind()
        self.assertEqual(bound['parent']['pid'],20)
        self.assertEqual(bound['springboard']['pid'],21)
        self.assertFalse(bound['acceptance'])
        self.assertTrue(b.recheck_bound(self.after,bound))

    def test_wrong_target_runtime_and_launch_failure_rejected(self):
        for change in ({'command':['xcrun','simctl','launch','11111111-1111-1111-1111-111111111111',b.APP]},
                       {'timed_out':True},{'exit_code':1},{'elapsed_seconds':31},
                       {'settings_pid':0},{'stdout':'com.apple.Preferences: 92'}):
            with self.subTest(change=change), self.assertRaises(b.BindingError):
                self.bind(record={**self.record,**change})
        with self.assertRaises(b.BindingError):self.bind(root=ROOT.replace('24A434','23F77'))
        with self.assertRaises(b.BindingError):self.bind(uuid='wrong')

    def test_preexisting_pid_missing_parent_or_springboard_rejected(self):
        with self.assertRaises(b.BindingError):self.bind(before=self.before+[self.after[2]])
        with self.assertRaises(b.BindingError):self.bind(after=[r for r in self.after if r['pid']!=20])
        with self.assertRaises(b.BindingError):self.bind(after=[r for r in self.after if r['pid']!=21])

    def test_duplicate_rows_or_siblings_rejected(self):
        with self.assertRaises(b.BindingError):self.bind(after=self.after+[self.after[2]])
        with self.assertRaises(b.BindingError):self.bind(after=self.after+[row(22,20,ROOT+b.SPRINGBOARD_SUFFIX)])
        with self.assertRaises(b.BindingError):self.bind(after=self.after+[row(92,20,ROOT+b.PREFERENCES_SUFFIX)])

    def test_pid_reuse_replacement_and_missing_rows_rejected(self):
        bound=self.bind()
        with self.assertRaises(b.BindingError):
            b.recheck_bound([*self.after[:2],{**self.after[2],'lstart':'Fri Sep 25 00:00:00 2026'},*self.after[3:]],bound)
        with self.assertRaises(b.BindingError):b.recheck_bound(self.after+[row(22,20,ROOT+b.SPRINGBOARD_SUFFIX)],bound)
        with self.assertRaises(b.BindingError):b.recheck_bound(self.after[:2]+self.after[3:],bound)


if __name__=='__main__': unittest.main()
