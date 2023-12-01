var npmConfig = require('npm-conf');

/**
 * This method only needs to be run when global-agent is used
 * Reference: https://github.com/cyclosproject/ng-swagger-gen/blob/master/ng-swagger-gen.js
 */
export const getProxyAndSetupEnv = () => {
    var proxyEnvVariableNames = [
        'https_proxy',
        'HTTPS_PROXY',
        'http_proxy',
        'HTTP_PROXY'
    ];

    var npmVariableNames = ['https-proxy', 'http-proxy', 'proxy'];

    var key;
    var val;
    var result;
    for (var i = 0; i < proxyEnvVariableNames.length; i++) {
        key = proxyEnvVariableNames[i];
        val = process.env[key];
        if (val) {
            // Get the first non-empty
            result = result || val;
        }
    }

    if (!result) {
        var config = npmConfig();

        for (i = 0; i < npmVariableNames.length && !result; i++) {
            result = config.get(npmVariableNames[i]);
        }
    }

    return result;
}
