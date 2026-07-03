#!/usr/bin/env node
// Assembles the publishable @zencrepes/zindexer-components package from the
// tsc output in lib/components. Run after `yarn build`; the package is
// written to dist/components/ and published in lockstep with zindexer (same
// version) by .github/workflows/publish-release.yml.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'lib', 'components');
const OUT = path.join(ROOT, 'dist', 'components');
const PACKAGE_NAME = '@zencrepes/zindexer-components';

// Directory names are camelCase in src/components; published subpaths use
// kebab-case, matching the names of the legacy @bit/zencrepes.zindexer.*
// packages (e.g. esUtils -> es-utils).
const toKebab = (name) =>
  name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

if (!fs.existsSync(SRC)) {
  console.error(`${SRC} not found. Run \`yarn build\` first.`);
  process.exit(1);
}

const rootPkg = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'),
);

const components = fs
  .readdirSync(SRC, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// Relative imports that cross component boundaries (e.g. ../config/...) must
// be rewritten when the target directory is renamed to kebab-case.
const renamed = components.filter((name) => toKebab(name) !== name);
const rewriteCrossImports = (code) => {
  let result = code;
  for (const name of renamed) {
    result = result.replace(
      new RegExp(`(["'])\\.\\./${name}(/|\\1)`, 'g'),
      (match, quote, tail) => `${quote}../${toKebab(name)}${tail}`,
    );
  }
  return result;
};

const copyDir = (from, to) => {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(source, target);
    } else if (/\.(js|d\.ts)$/.test(entry.name)) {
      fs.writeFileSync(
        target,
        rewriteCrossImports(fs.readFileSync(source, 'utf8')),
      );
    } else {
      fs.copyFileSync(source, target);
    }
  }
};

for (const name of components) {
  copyDir(path.join(SRC, name), path.join(OUT, toKebab(name)));
}

// External packages actually used by the compiled output: require() calls in
// .js files plus type imports left in .d.ts files.
const externals = new Set();
const collectExternals = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectExternals(file);
      continue;
    }
    if (!/\.(js|d\.ts)$/.test(entry.name)) continue;
    const code = fs.readFileSync(file, 'utf8');
    const specifiers = [
      ...code.matchAll(/require\(["']([^."'][^"']*)["']\)/g),
      ...code.matchAll(/from ["']([^."'][^"']*)["']/g),
    ].map((match) => match[1]);
    for (const spec of specifiers) {
      const parts = spec.split('/');
      externals.add(
        spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0],
      );
    }
  }
};
collectExternals(OUT);

const dependencies = {};
for (const name of [...externals].sort()) {
  const version = rootPkg.dependencies[name];
  if (!version) {
    console.error(
      `Component code depends on "${name}" but it is not a dependency of zindexer.`,
    );
    process.exit(1);
  }
  dependencies[name] = version;
}

const exportsMap = { './package.json': './package.json' };
for (const name of components) {
  exportsMap[`./${toKebab(name)}`] = {
    types: `./${toKebab(name)}/index.d.ts`,
    default: `./${toKebab(name)}/index.js`,
  };
}

fs.writeFileSync(
  path.join(OUT, 'package.json'),
  JSON.stringify(
    {
      name: PACKAGE_NAME,
      version: rootPkg.version,
      description:
        'Shared ZenCrepes components (ES mappings, ingestion and config logic), released in lockstep with zindexer.',
      license: rootPkg.license,
      author: rootPkg.author,
      homepage: rootPkg.homepage,
      repository: {
        type: 'git',
        url: 'git+https://github.com/zencrepes/zindexer.git',
      },
      sideEffects: false,
      exports: exportsMap,
      dependencies,
    },
    null,
    2,
  ) + '\n',
);

fs.writeFileSync(
  path.join(OUT, 'README.md'),
  [
    `# ${PACKAGE_NAME}`,
    '',
    'Shared ZenCrepes components, built from [zindexer](https://github.com/zencrepes/zindexer)',
    '(`src/components/`) and released in lockstep with it (same version).',
    '',
    'Each component is exposed as a subpath:',
    '',
    '```ts',
    `import { zencrepesConfig } from '${PACKAGE_NAME}/config';`,
    `import { checkEsIndex, pushEsNodes } from '${PACKAGE_NAME}/es-utils';`,
    '```',
    '',
    'Available components:',
    '',
    ...components.map((name) => `- \`${PACKAGE_NAME}/${toKebab(name)}\``),
    '',
  ].join('\n'),
);

console.log(
  `Assembled ${PACKAGE_NAME}@${rootPkg.version} in dist/components/ ` +
    `(${components.length} components, dependencies: ${Object.keys(dependencies).join(', ')})`,
);
