const textExtensions   = ['.txt',   '.md']
const markupExtensions = ['.html',  '.pug',   '.jade']
const stylesExtensions = ['.css',   '.scss',  '.sass',  '.less']
const jsExtensions     = ['.js',    '.jsx',   '.ts',    '.tsx']
const dataExtensions   = ['.json',  '.xml',   '.csv',   '.tsv']
const bitmapExtensions = ['.jpg',   '.jpeg',  '.png',   '.gif']
const vectorExtensions = ['.svg']

const allExtensions = [
  ...textExtensions,
  ...markupExtensions,
  ...stylesExtensions,
  ...jsExtensions,
  ...dataExtensions,
  ...bitmapExtensions,
  ...vectorExtensions
]

const tempConfig = {
  rel_path: '.temp'
}

const envConfig = {
  src_rel_path: 'src',
  builds: [{
    name: 'dev',
    local_server_port: '3000',
    temp_source_copy_dir_name_prefix: 'env-dev-source-copy',
    build_output_rel_path: 'dist/dev/env',
    source_watched_extensions: allExtensions,
    build_watched_extensions: allExtensions
  }]
}

const staticsConfig = {
  src_rel_path: 'lm-statics',
  types_rel_path_from_src: 'types',
  root_url_template: '{{ROOT_URL}}',
  this_url_template: '{{THIS_URL}}',
  parent_url_template: '{{PARENT_URL}}',
  templating_allowed_extensions: [
    ...textExtensions,
    ...markupExtensions,
    ...stylesExtensions,
    ...jsExtensions,
    ...dataExtensions
  ],
  builds: [{
    name: 'dev',
    local_server_port: '3001',
    root_url: 'http://localhost:3001',
    build_output_rel_path: 'dist/dev/statics',
    temp_source_copy_dir_name_prefix: 'statics-dev-source-copy',
    temp_source_reference_dir_name: 'statics-dev-source-reference',
    temp_source_diff_dir_name_prefix: 'statics-dev-source-diff',
    temp_build_reference_dir_name: 'statics-dev-build-reference',
    readme_markdown_html_stylesheets_paths: [
      '/styles/fonts.css',
      '/styles/variables.css',
      '/lib/highlightjs/v11.5.0/material-palenight.min.css'
    ],
    aliases: {
      '/le-monde/styles/reset.css': '/styles/reset.css',
      '/le-monde/styles/fonts_last.css': '/styles/le-monde/fonts_last.css',
      '/le-monde/styles/header-footer.css': '/styles/le-monde/header-footer.css',
      '/le-monde/styles/icons.css': '/styles/le-monde/icons.css',
      '/le-monde/styles/multimedia.css': '/styles/le-monde/multimedia.css',
      '/le-monde/styles/snippets.css': '/styles/le-monde/snippets.css',
      '/le-monde/styles/swg-button.css': '/styles/le-monde/swg-button.css'
    },
    source_watched_extensions: allExtensions,
    build_watched_extensions: allExtensions,
    build_skip_paths: [
      '.git',
      '.gitignore',
      '/.legacy',
      '/components/some-htm-comp'
    ],
    remove_after_build_paths: [
      '/tsconfig.json'
    ],
    js_uglification_skip_paths: [
      '/lib',
      '/utils/le-monde-page-templates'
    ]
  }, {
    name: 'prod',
    local_server_port: '3001',
    root_url: 'https://assets-decodeurs.lemonde.fr/redacweb/statics-v2',
    build_output_rel_path: 'dist/prod/statics',
    temp_source_copy_dir_name_prefix: 'statics-prod-source-copy',
    temp_source_reference_dir_name: 'statics-prod-source-reference',
    temp_source_diff_dir_name_prefix: 'statics-prod-source-diff',
    temp_build_reference_dir_name: 'statics-prod-build-reference',
    readme_markdown_html_stylesheets_paths: [
      '/styles/fonts.css',
      '/styles/variables.css',
      '/lib/highlightjs/v11.5.0/material-palenight.min.css'
    ],
    aliases: {
      '/le-monde/styles/reset.css': '/styles/reset.css',
      '/le-monde/styles/fonts_last.css': '/styles/le-monde/fonts_last.css',
      '/le-monde/styles/header-footer.css': '/styles/le-monde/header-footer.css',
      '/le-monde/styles/icons.css': '/styles/le-monde/icons.css',
      '/le-monde/styles/multimedia.css': '/styles/le-monde/multimedia.css',
      '/le-monde/styles/snippets.css': '/styles/le-monde/snippets.css',
      '/le-monde/styles/swg-button.css': '/styles/le-monde/swg-button.css'
    },
    source_watched_extensions: allExtensions,
    build_watched_extensions: allExtensions,
    build_skip_paths: [
      '.git',
      '.gitignore',
      '/.legacy',
      '/components/some-htm-comp'
    ],
    remove_after_build_paths: [
      '/tsconfig.json'
    ],
    js_uglification_skip_paths: [
      '/lib',
      '/utils/le-monde-page-templates'
    ]
  }]
}

const config = {
  temp: tempConfig,
  env: envConfig,  
  statics: staticsConfig
}

export default config
