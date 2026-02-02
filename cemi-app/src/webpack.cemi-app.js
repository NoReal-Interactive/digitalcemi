const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: "production", // enable many optimizations for production build

  entry: './cemi-app/src/index.ts',
  
  output: {
    filename: 'tazebao.services.min.js', // Nome del file di output minificato
    path: path.resolve(__dirname, '../js/dist'), // Cartella di output
    library: 'TazebaoServices', // Nome della libreria globale se vuoi esporla nel browser
    libraryTarget: 'umd', // Formato UMD per compatibilità con CommonJS, AMD o browser globals
  },
  resolve: {
    extensions: ['.ts', '.js'], // Estensioni che Webpack deve risolvere
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // Applica ts-loader a tutti i file .ts
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: true, // Abilita la minificazione
    minimizer: [new TerserPlugin()], // Usa TerserPlugin per la minificazione
  },
  // Ignora la cartella 'dist' per evitare ricompilazioni infinite
  // Questo è importante se 'dist' è inclusa in tsconfig.json
  watchOptions: {
    ignored: /dist/,
  },
};