const tempConfig = {
  rel_path: '.temp'
}

const envConfig = {
  src_rel_path: 'src',
  builds: [{
    name: 'dev',
    root_url_port: '3000',
    temp_source_copy_dir_name_prefix: 'env-dev-source-copy',
    build_output_rel_path: 'dist/dev/env'
  }]
}

const staticsConfig = {
  src_rel_path: 'lm-statics/src',

  root_url_template: '{{ROOT_URL}}',
  this_url_template: '{{THIS_URL}}',
  parent_url_template: '{{PARENT_URL}}',
  templating_allowed_extensions: [
    '.txt',     '.md',
    '.html',    '.pug',     '.jade',    '.mustache',
    '.js',      '.jsx',     '.ts',      '.tsx',       '.json',
    '.css',     '.scss',    '.sass',    '.less'
  ],

  builds: [{
    name: 'dev',
    root_url_port: '3001',
    root_url: 'http://localhost:3001',
    temp_source_copy_dir_name_prefix: 'statics-dev-source-copy',
    temp_source_reference_dir_name: 'statics-dev-source-reference',
    temp_source_diff_dir_name_prefix: 'statics-dev-source-diff',
    temp_build_reference_dir_name: 'statics-dev-build-reference',
    build_output_rel_path: 'dist/dev/statics',
    readme_markdown_html_stylesheets_paths: [
      'http://localhost:3001/styles/fonts.css',
      'http://localhost:3001/styles/variables.css',
      'http://localhost:3001/lib/highlightjs/v11.5.0/material-palenight.min.css'
    ],
    aliases: {
      '/le-monde/styles/reset.scss': '/styles/reset.scss'
    }
  }]
}

const config = {
  temp: tempConfig,
  env: envConfig,  
  statics: staticsConfig
}

export default config
