import './test/test-setup';
import './landingwidget';
import {ChromiumLandingWidget} from './landingwidget';

suite('chromium-landing-widget tests', () => {
  let element: ChromiumLandingWidget;

  setup(() => {
    element = document.createElement('chromium-landing-widget');
    document.body.appendChild(element);
  });

  teardown(() => {
    document.body.removeChild(element);
  });

  test('onChange sets element.versions', async () => {
    sinon.stub(element, 'getProjectConfig').returns(
      Promise.resolve({
        instanceName: 'instance',
        serviceUrl: 'service-url',
        disabled: false,
        projectPatterns: [],
      })
    );
    sinon.stub(element, 'fetchJSON').returns(
      Promise.resolve({
        versions: ['version1', 'version2'],
      })
    );
    Object.assign(element, {
      restApi: {
        get: () => {
          return {};
        },
      },
      change: {
        status: 'MERGED',
        _number: 1,
      },
      versions: [],
      hasVersionInfo: false,
    });
    await element.onChange();
    assert.deepEqual(element.versions, [
      {text: 'version1', link: 'service-url/cl?q=instance:1'},
      {text: 'version2', link: 'service-url/cl?q=instance:1'},
    ]);
    assert.strictEqual(element.hasVersionInfo, true);
  });

  test('getProjectConfig loads the LandingWidget config', async () => {
    const config = {
      instanceName: 'instance',
      serviceUrl: 'service-url',
      disabled: false,
      projectPatterns: ['a', 'b'],
    };
    Object.assign(element, {
      plugin: {
        restApi: () => {
          return {get: () => config};
        },
      },
    });
    assert.strictEqual(await element.getProjectConfig('c'), null);
    assert.deepEqual(await element.getProjectConfig('a'), config);
  });

  test('fetchJSON parses the response text', async () => {
    const obj = {a: [1, 2, 3], b: {c: 'd'}};
    sinon.stub(window, 'fetch').returns(
      Promise.resolve({
        ok: true,
        text: async () => `)]}'${JSON.stringify(obj)}`,
      }) as any
    );
    assert.deepEqual(await element.fetchJSON('https://foo.com', {}), obj);
  });
});
