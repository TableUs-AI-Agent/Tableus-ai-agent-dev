import hashlib
import tempfile
import unittest
import zipfile
from pathlib import Path
from scripts import maestro_toolchain_identity as m

class IdentityTests(unittest.TestCase):
    def fixture(self, entries=None):
        temp=tempfile.TemporaryDirectory();root=Path(temp.name)
        real=root/'maestro-real';real.write_bytes(b'launcher')
        link=root/'maestro';link.symlink_to(real)
        jar=root/'cli.jar'
        with zipfile.ZipFile(jar,'w') as z:
            for name,value in ([('version.properties',b'# date\nversion=2.8.0\n')] if entries is None else entries):z.writestr(name,value)
        h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
        return temp,[link,real.resolve(),h(real),jar,h(jar)]
    def test_exact_identity(self):
        temp,args=self.fixture()
        with temp:self.assertEqual(m.read_identity(*args)['version'],'2.8.0')
    def test_wrong_hash_realpath_version(self):
        temp,args=self.fixture()
        with temp:
            for n,value in [(2,'0'*64),(4,'0'*64),(1,Path(temp.name)/'wrong')]:
                altered=list(args);altered[n]=value
                with self.assertRaises(m.ToolchainIdentityError):m.read_identity(*altered)
            with self.assertRaises(m.ToolchainIdentityError):m.read_identity(*args,expected_version='2.9.0')
    def test_missing_duplicate_oversized_malformed(self):
        cases=[[],[('version.properties',b'version=2.8.0\n')]*2,
               [('version.properties',b'x'*4097)], [('version.properties',b'version=2.8.0\nversion=2.8.0\n')],
               [('version.properties',b'other=2.8.0\n')], [('version.properties',b'version=2.8.0-RC\n')]]
        for entries in cases:
            temp,args=self.fixture(entries)
            with temp,self.subTest(entries=entries),self.assertRaises(m.ToolchainIdentityError):m.read_identity(*args)
    def test_bad_jar_and_bad_inputs(self):
        temp,args=self.fixture()
        with temp:
            Path(args[3]).write_bytes(b'not zip');args[4]=hashlib.sha256(Path(args[3]).read_bytes()).hexdigest()
            with self.assertRaises(m.ToolchainIdentityError):m.read_identity(*args)
            with self.assertRaises(m.ToolchainIdentityError):m.read_identity(*args[:2],'bad',*args[3:])

if __name__=='__main__':unittest.main()
