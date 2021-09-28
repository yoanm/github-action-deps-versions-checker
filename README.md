<p align="center">
    <a href="https://github.com/yoanm/github-action-deps-versions-checker/actions/workflows/live-test.yml?query=event%3Apush"><img alt="typescript-action status" src="https://github.com/yoanm/github-action-deps-versions-checker/actions/workflows/live-test.yml/badge.svg?event=push"></a>
    <a href="https://github.com/yoanm/github-action-deps-versions-checker/actions/workflows/ci.yml?query=event%3Apush"><img alt="typescript-action status" src="https://github.com/yoanm/github-action-deps-versions-checker/actions/workflows/ci.yml/badge.svg?event=push"></a>
</p>

# Github action - Dependencies versions checker

## How to use

### Append results as PR comment
```
name: 'Append PR extra infos'
on: 
  pull_request: [ synchronize ]
jobs:
  main:
    name: "Composer package updates"
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - name: "Check composer packages versions"
        uses: yoanm/github-action-deps-versions-checker@v0.4.0
        with:
          gh-token: ${{ secrets.GITHUB_TOKEN }}
          manager: composer

```

### Re-use action outputs

- `force: true` : to be sure to always have the diff
- `post-results: false` : Not required, just in case you don't care about results comment

```
name: 'Append PR extra infos'
on: 
  pull_request: [ synchronize ]
jobs:
  main:
    name: "Composer package updates"
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: read
    steps:
      - name: "Check composer packages versions"
        uses: yoanm/github-action-deps-versions-checker@v0.4.0
        id: 'diff'
        with:
          gh-token: ${{ secrets.GITHUB_TOKEN }}
          manager: composer
          force: true
          post-results: false
      - name: Print diff
        run: echo "${{ steps.diff.outputs.diff }}"
```

## Required permissions

`contents: read` is always required (in order to fetch data)

Based on event type and if you want to post results, see below other required permissions:
| Event | type | Post results ? | Required permissions |
| ---: |  :--- | :---: | :--- | 
| PR | synchronize | ✅ | `pull-requests: write` |
| PR | synchronize | ❌ | `pull-requests: read` |
| PUSH | new tag | ✅ | `releases: write` |
| PUSH | new tag | ❌ | `releases: read` |
<!-- | PUSH | branch | ❌ |  | -->

It's not mandatory to define `permissions`, but it increases your repository security. At least, be sure required permissions match current ones


## Inputs

_Check `action.yml` file for more information about inputs_
- `gh-token` **Required**
- `manager` **Required**
- `post-results` **Default to `true`**
- `force` **Default to `false`**

## Outputs

- `diff`
