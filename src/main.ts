import * as core from '@actions/core'
import * as github from '@actions/github'
import { components } from '@octokit/openapi-types'
import filterAsync from 'node-filter-async'

type Octokit = ReturnType<typeof github.getOctokit>
type Environment = components['schemas']['environment']
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const token: string = core.getInput('token', { required: true })
    const octokit = github.getOctokit(token)
    const { owner, repo } = github.context.repo

    const tags: string[] = parseMultiline(
      core.getInput('tags', { required: true })
    )

    const envVar: string = core.getInput('environment_variable')
    const environments: string[] =
      parseMultiline(core.getInput('environments')) ||
      fetchEnvironments(octokit, owner, repo)
    const includeNoRegex = !!core.getInput('include_no_regex')
    core.debug(`tags: ${tags}`)
    core.debug(`envVar: ${envVar}`)
    core.debug(`environments: ${environments}`)
    core.debug(`includeNoRegex: ${includeNoRegex}`)

    const repository_id = await getRepositoryId(octokit, owner, repo)

    const matchingEnvironments = await (async () => {
      return filterAsync(environments, async (environment_name: string) => {
        const result = await octokit.rest.actions.getEnvironmentVariable({
          repository_id,
          environment_name,
          name: envVar
        })

        const regex = result?.data?.value

        if (!regex && includeNoRegex) {
          return true
        }
        if (!regex) {
          return false
        }

        return tags.some((tag: string) => {
          const match = !!tag.match(regex)
          core.debug(`tag: ${tag} regex: ${regex} match: ${match}`)
          return !!match
        })
      })
    })()

    core.debug(`environments: ${matchingEnvironments}`)

    core.setOutput('environments', JSON.stringify(matchingEnvironments))
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }

  function parseMultiline(input: string): string[] {
    return input
      .split(/\r?\n/)
      ?.map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
  }

  async function fetchEnvironments(
    octokit: Octokit,
    owner: string,
    repo: string
  ): Promise<string[]> {
    const result = await octokit.rest.repos.getAllEnvironments({
      owner,
      repo
    })

    return result.data.environments?.map((env: Environment) => env.name) ?? []
  }

  async function getRepositoryId(
    octokit: Octokit,
    owner: string,
    repo: string
  ): Promise<number> {
    const repoResult = await octokit.rest.repos.get({
      owner,
      repo
    })

    return repoResult.data.id
  }
}
