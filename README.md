<!-- start title -->

# GitHub Action: filtered-env

<!-- end title -->
<!-- markdownlint-capture -->
<!-- markdownlint-disable -->
<div align="center">
<!-- start badges -->
<a href="https://github.com/wreality/filtered-env/releases/latest"><img src="https://img.shields.io/github/v/release/wreality/filtered-env?display_name=tag&sort=semver&logo=github&style=flat-square" alt="Release" /></a><a href="https://github.com/wreality/filtered-env/releases/latest"><img src="https://img.shields.io/github/release-date/wreality/filtered-env?display_name=tag&sort=semver&logo=github&style=flat-square" alt="Release" /></a><img src="https://img.shields.io/github/last-commit/wreality/filtered-env?logo=github&style=flat-square" alt="Commit" /><a href="https://github.com/wreality/filtered-env/issues"><img src="https://img.shields.io/github/issues/wreality/filtered-env?logo=github&style=flat-square" alt="Open Issues" /></a><img src="https://img.shields.io/github/downloads/wreality/filtered-env/total?logo=github&style=flat-square" alt="Downloads" />
<!-- end badges -->

[![GitHub Super-Linter](https://github.com/wreality/filtered-env/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/wreality/filtered-env/actions/workflows/ci.yml/badge.svg)

</div>
Fetch the list of environments configured on the repository and read the `TAG_REGEX` variable on each.
If the `TAG_REGEX` regular expression matches any of the tags provided, the environment is included in the
output.

This action is most useful when paired with [docker/metadata-action](https://github.com/docker/metadata-action).
The environments output can then be fed into a matrix strategy for a dependent job to deploy only the environments
that match.

<!-- markdownlint-restore -->

```yaml
name: CI
on:
  pull_request:
  merge_group:
  push:
    branches:
      - main
jobs:
  build_and_push:
    name: "Build and push"
    runs-on: ubuntu-20.04
    outputs:
      tags: ${{ steps.meta.outputs.tags }} # Send the tags output from docker/metadata-action to dependent jobs
    steps:
      - uses: actions/checkout@v3
      - name: Login to Github Packages
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Docker meta
        id: meta # Make sure to set an id on this step to reference the output
        uses: docker/metadata-action@v5
        with:
          images: |
            ghcr.io/${{ github.repository }}/package
          tags: |
            type=edge
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
      - name: Build and push
        uses: docker/bake-action@v4
        with:
          files: Dockerfile
          push: true
  environments:
    needs: [build_and_push] # Make this job depend on build_and_push so we can access the tags output
    runs-on: ubuntu-20.04
    outputs:
      environments: ${{ steps.matches.outputs.environments }} # Send the environments list to dependent jobs
    steps:
      - uses: wreality/filtered-env@1
        id: matches # Set an id here so that we can reference the output
        with:
          token: ${{ secrets.GITHUB_TOKEN }} # Note, this must be a token  with READ access to environment variables.
          tags: ${{ needs.build_and_push.outputs.tags }} #  Reference the tags from docker/metadata-action
  deploy:
    needs: [environments] # Make this job depend on enironments so we can access the filtered environment list
    runs-on: ubuntu-20.04
    strategy:
      matrix:
        # Use the filtered environments list to create a job matrix.
        environment: ${{ fromJson(needs.environments.outputs.environments)}}
    environment: ${{ strategy.matrix.environment}} # Set the environment from the matrix
    steps:
      # This is where you'd execute your deployment steps.  You have full access to environment secrets and variables.
      - run: echo "Deploy"
        shell: bash
```

<!-- start contents -->

<!-- end contents -->

<!-- markdownlint-capture -->
<!-- markdownlint-disable -->
<!-- start inputs -->

| \***\*Input\*\***          | \***\*Description\*\***                                                                  | \***\*Default\*\*** | \***\*Required\*\*** |
| -------------------------- | ---------------------------------------------------------------------------------------- | ------------------- | -------------------- |
| `**tags**`                 | Tags (usually from docker metadata action)                                               |                     | **true**             |
| `**token**`                | GitHub token with repository read permissions                                            |                     | **true**             |
| `**environment_variable**` | GitHub environment variable that contains the regular expression to match                | `TAG_REGEX`         | **false**            |
| `**environments**`         | Comma separated list of environments to match against (fetched from API if not provided) |                     | **false**            |
| `**include_no_regex**`     | Include environments in output that do not have a regular expression variable            |                     | **false**            |

<!-- end inputs -->

<!-- start outputs -->

| \***\*Output\*\*** | \***\*Description\*\***                                        |
| ------------------ | -------------------------------------------------------------- |
| `**environments**` | JSON srtring of environments that match the regular expression |

<!-- end outputs -->
<!-- markdownlint-restore -->
<!-- start [.github/ghadocs/examples/] -->

<!-- end [.github/ghadocs/examples/] -->
