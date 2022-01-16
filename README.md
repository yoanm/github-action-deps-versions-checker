<p align="center">
    <a href="https://github.com/yoanm/github-action-deps-versions-checker/actions/workflows/live-test.yml?query=event%3Apush"><img alt="typescript-action status" src="https://github.com/yoanm/github-action-deps-versions-checker/actions/workflows/live-test.yml/badge.svg?event=push"></a>
    <a href="https://github.com/yoanm/github-action-deps-versions-checker/actions/workflows/ci.yml?query=event%3Apush"><img alt="typescript-action status" src="https://github.com/yoanm/github-action-deps-versions-checker/actions/workflows/ci.yml/badge.svg?event=push"></a>
</p>

# Github action - Dependencies versions checker

## How to use

### Append results as PR comment
```yaml
name: 'Append PR extra infos'
on: 
  pull_request:
    types:
      - opened
      - synchronize
jobs:
  main:
    name: "Composer package updates"
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - name: "Check composer packages versions"
        uses: yoanm/github-action-deps-versions-checker@v1
        with:
          gh-token: ${{ secrets.GITHUB_TOKEN }}
#          manager: composer # Default value

```

### Re-use action outputs

- `force: true` : to be sure to always have the diff
- `post-results: false` : Not required, just in case you don't care about results comment

```yaml
name: 'Append PR extra infos'
on: 
  pull_request:
    types:
      - opened
      - synchronize
jobs:
  main:
    name: "Composer package updates"
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: read
    steps:
      - name: "Check composer packages versions"
        uses: yoanm/github-action-deps-versions-checker@v1
        id: 'diff'
        with:
          gh-token: ${{ secrets.GITHUB_TOKEN }}
#          manager: composer # Default value
          force: true
          post-results: false
      - name: Print diff
        run: echo "${{ steps.diff.outputs.diff }}"
```

## Required permissions

Action requires at least following permissions:
- `contents: read`: Used to fetch old and current package manager files
- `pull-requests: write`: Used to know if lock file has been updated or not and manage result comment
    - In case you set `post-results` at `false`, read access is enough (`pull-requests: read`)

It's not mandatory to define `permissions`, but it increases your repository security. At least, be sure required permissions match current ones


## Inputs

_Check `action.yml` file for more information about inputs_
- `gh-token` **Required**
  - Github token used for API calls, be sure required permissions are granted 
- `manager` **Default to `composer`**
- `post-results` **Default to `true`**
- `force` **Default to `false`**

## Outputs

- `diff`
