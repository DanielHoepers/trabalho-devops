import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('release', Path(__file__).with_name('products-release.py'))
release = importlib.util.module_from_spec(spec)
spec.loader.exec_module(release)

class ReleaseTest(unittest.TestCase):
    def test_dev_and_homol(self):
        self.assertEqual(release.metadata('0.2.0', 'develop', 'a'*40, '17')['version'], '0.2.0-dev.17')
        self.assertEqual(release.metadata('0.2.0', 'main', 'a'*40, '17')['tag'], 'products-v0.2.0')
    def test_untrusted_inputs(self):
        for version, branch, sha, run in [('v1.0.0','main','a'*40,'1'),('01.0.0','main','a'*40,'1'),('1.0.0','feature/test','a'*40,'1'),('1.0.0','main','bad','1'),('1.0.0','develop','a'*40,'oops')]:
            with self.assertRaises(ValueError): release.metadata(version, branch, sha, run)
    def test_stable_reuse_requires_original_commit(self):
        self.assertEqual(release.existing_image('a'*40, {'revision': 'a'*40, 'digest':'sha256:'+'b'*64}), 'sha256:'+'b'*64)
        with self.assertRaises(ValueError): release.existing_image('a'*40, {'revision':'c'*40, 'digest':'sha256:'+'b'*64})

if __name__ == '__main__': unittest.main()
