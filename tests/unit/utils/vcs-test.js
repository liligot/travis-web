import { vcsUrl, vcsName, vcsVocab, vcsIcon } from 'travis/utils/vcs';
import { module, test } from 'qunit';

module('Unit | Utils | vcsName', function () {
  test('it defaults to Github', function (assert) {
    assert.equal(vcsName(), 'GitHub');
    assert.equal(vcsName(null), 'GitHub');
    assert.equal(vcsName(''), 'GitHub');
  });

  test('it handles Github', function (assert) {
    assert.equal(vcsName('GithubRepository'), 'GitHub');
  });

  test('it handles Bitbucket', function (assert) {
    assert.equal(vcsName('BitbucketRepository'), 'Bitbucket');
  });

  test('it throws when vcs is not found in providers', function (assert) {
    assert.throws(() => vcsName('OtherVcs'));
  });
});

module('Unit | Utils | vcsVocab', function () {
  test('it returns the vocabulary key', function (assert) {
    assert.equal(vcsVocab('GithubRepository', 'pullRequest'), 'Pull Request');
    assert.equal(vcsVocab('AssemblaRepository', 'pullRequest'), 'Merge Request');
    assert.equal(vcsVocab('GithubRepository', 'organization'), 'Organization');
    assert.equal(vcsVocab('AssemblaRepository', 'organization'), 'Portfolio');
  });

  test('throws if key is invalid', function (assert) {
    assert.throws(() => vcsVocab('GithubRepository', 'unknownKey'));
  });
});

module('Unit | Utils | vcsIcon', function () {
  test('it returns the icon', function (assert) {
    assert.equal(vcsIcon('GithubRepository'), 'icon-repooctocat');
    assert.equal(vcsIcon('AssemblaRepository'), 'icon-assembla');
  });
});

module('Unit | Utils | vcsUrl', function () {
  test('it returns the formatted URL', function (assert) {
    assert.equal(
      vcsUrl('branch', 'GithubRepository', { owner: 'theowner', repo: 'therepo', branch: 'thebranch' }),
      'https://github.com/theowner/therepo/tree/thebranch'
    );
  });

  test('throws if any param is missing', function (assert) {
    assert.throws(() => vcsUrl('branch', 'GithubRepository', { owner: 'owner', repo: 'repo' }));
  });
});
