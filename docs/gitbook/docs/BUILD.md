# Building PIXELMINER Documentation

This guide explains how to build and deploy the PIXELMINER documentation.

## Prerequisites

- Node.js (v16 or later)
- npm (v7 or later)
- Git

## Local Development

1. Install dependencies:
```bash
cd docs/gitbook
npm install
```

2. Start the development server:
```bash
npm run serve
```
This will start a local server at `http://localhost:4000`

## Building for Production

1. Build the documentation:
```bash
npm run build
```
This will create a `_book` directory with the static site.

2. Preview the build:
```bash
cd _book
python -m http.server 4000
```
Visit `http://localhost:4000` to preview the built documentation.

## Deployment

The documentation is automatically deployed to GitHub Pages when changes are pushed to the main branch. The deployment process:

1. Builds the documentation
2. Deploys to the `gh-pages` branch
3. Makes the documentation available at `https://posgame3.github.io/web3miner/`

## Adding Content

1. Create new markdown files in the appropriate directory
2. Add the file to `SUMMARY.md`
3. Use the following format for images:
```markdown
![Image Description](../assets/image-name.png)
```

## Troubleshooting

If you encounter any issues:

1. Clear the build cache:
```bash
rm -rf _book
rm -rf node_modules
npm install
```

2. Check for GitBook errors:
```bash
gitbook build --log=debug
```

3. Verify your markdown syntax:
```bash
npm install -g markdownlint
markdownlint .
```

## Contributing

1. Create a new branch for your changes
2. Make your changes
3. Test locally using `npm run serve`
4. Submit a pull request

## Resources

- [GitBook Documentation](https://toolchain.gitbook.com/)
- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Pages](https://pages.github.com/) 