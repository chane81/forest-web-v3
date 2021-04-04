const TerserPlugin = require('terser-webpack-plugin');
const withPlugins = require('next-compose-plugins');
const isDev = process.env.NODE_ENV === 'development';
const Dotenv = require('dotenv-webpack');
const dotEnvPath = `./config/.env.${isDev ? 'dev' : 'prod'}`;

const nextConfig = {
  // 압축사용
  compress: !isDev,

  // 웹팩 설정
  webpack: (config, options) => {
    const originalEntry = config.entry
		config.plugins = config.plugins || [];
		
		if (options.dev) {
			config.devtool = 'cheap-module-source-map'
		}

    // dotenv 에 대한 'Module not found: Can't resolve 'fs' 에러 방지
    if (!options.isServer) {
      config.node = {
        fs: 'empty'
      }
    }

    // 코드 난독화/압축화
    if (!isDev && !options.isServer) {
      config.optimization.minimizer = [new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: isDev ? true : false
      })]
    }

    // entry 설정
    config.entry = async () => {
      const entries = await originalEntry()

      return entries
		}
		
		config.plugins.push(
			new Dotenv({
				path: dotEnvPath
			})
		)

    return config
  }
};

module.exports = withPlugins([], nextConfig);