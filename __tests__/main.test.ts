/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as github from '@actions/github'
import * as main from '../src/main'
import { mocked } from './deepMock'

// Mock the GitHub Actions core library
const debugMock = jest.spyOn(core, 'debug')
const getInputMock = jest.spyOn(core, 'getInput')
const setOutputMock = jest.spyOn(core, 'setOutput')
const setFailedMock = jest.spyOn(core, 'setFailed')

const getOctokitMock = jest.spyOn(github, 'getOctokit')

const octokitMock = jest.requireActual('./deepMock').deepMock()

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub context
process.env.GITHUB_REPOSITORY = 'owner/repo'

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    debugMock.mockImplementation(() => {})
    setOutputMock.mockImplementation(() => {})
    getOctokitMock.mockImplementation(() => octokitMock)
    setFailedMock.mockImplementation(() => {})
  })

  it('matches regexes', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return 'token'
        case 'tags':
          return 'package:one\npackage:two\npackage:three'
        case 'environments':
          return 'env1\nenv2\nenv3'
        default:
          return ''
      }
    })

    mocked(octokitMock.rest.actions.getEnvironmentVariable).mockImplementation(
      ({ environment_name }) => {
        switch (environment_name) {
          case 'env1':
            return { data: { value: ':one$' } }
          case 'env2':
            return { data: { value: ':four$' } }
          case 'env3':
            return { data: { value: ':two$' } }
        }
      }
    )

    await main.run()
    expect(runMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenCalledWith(
      'environments',
      JSON.stringify(['env1', 'env3'])
    )
  })

  it('excludes environments with no regex by default', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return 'token'
        case 'tags':
          return 'package:one\npackage:two\npackage:three'
        case 'environments':
          return 'env1\nenv2\nenv3'
        default:
          return ''
      }
    })
    mocked(octokitMock.rest.actions.getEnvironmentVariable).mockImplementation(
      ({ environment_name }) => {
        switch (environment_name) {
          case 'env2':
            return { data: { value: ':four$' } }
          case 'env3':
            return { data: { value: ':two$' } }
        }
      }
    )

    await main.run()
    expect(runMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenCalledWith(
      'environments',
      JSON.stringify(['env3'])
    )
  })

  it('includes environments with include_no_regex', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return 'token'
        case 'tags':
          return 'package:one\npackage:two\npackage:three'
        case 'environments':
          return 'env1\nenv2\nenv3'
        case 'include_no_regex':
          return 'true'
        default:
          return ''
      }
    })

    mocked(octokitMock.rest.actions.getEnvironmentVariable).mockImplementation(
      ({ environment_name }) => {
        switch (environment_name) {
          case 'env2':
            return { data: { value: ':four$' } }
          case 'env3':
            return { data: { value: ':two$' } }
        }
      }
    )

    await main.run()
    expect(runMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenCalledWith(
      'environments',
      JSON.stringify(['env1', 'env3'])
    )
  })

  it('gets environments from the api if not provided', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return 'token'
        case 'tags':
          return 'package:one\npackage:two\npackage:three'
        case 'include_no_regex':
          return 'true'
        default:
          return ''
      }
    })

    mocked(octokitMock.rest.actions.getEnvironmentVariable).mockImplementation(
      ({ environment_name }) => {
        switch (environment_name) {
          case 'env2':
            return { data: { value: ':four$' } }
          case 'env3':
            return { data: { value: ':two$' } }
        }
      }
    )

    mocked(octokitMock.rest.repos.getAllEnvironments).mockImplementation(() => {
      return {
        data: {
          environments: [{ name: 'env1' }, { name: 'env2' }, { name: 'env3' }]
        }
      }
    })
    await main.run()
    expect(runMock).toHaveReturned()
    expect(mocked(octokitMock.rest.repos.getAllEnvironments)).toHaveBeenCalled()
  })

  it('uses supplied input as variable name', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return 'token'
        case 'tags':
          return 'package:one\npackage:two\npackage:three'
        case 'environment_variable':
          return 'MY_VAR'
        default:
          return ''
      }
    })

    mocked(octokitMock.rest.actions.getEnvironmentVariable).mockImplementation(
      ({ environment_name }) => {
        switch (environment_name) {
          case 'env2':
            return { data: { value: ':four$' } }
          case 'env3':
            return { data: { value: ':two$' } }
        }
      }
    )

    mocked(octokitMock.rest.repos.getAllEnvironments).mockImplementation(() => {
      return {
        data: {
          environments: [{ name: 'env1' }, { name: 'env2' }, { name: 'env3' }]
        }
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()
    expect(mocked(octokitMock.rest.repos.getAllEnvironments)).toHaveBeenCalled()
    expect(
      mocked(octokitMock.rest.actions.getEnvironmentVariable)
    ).toHaveBeenCalledWith(expect.objectContaining({ name: 'MY_VAR' }))
  })

  it('sets failed if error is thrown', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return 'token'
        case 'tags':
          return 'package:one\npackage:two\npackage:three'
        default:
          return ''
      }
    })

    mocked(octokitMock.rest.repos.getAllEnvironments).mockImplementation(() => {
      throw new Error('test error')
    })

    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalledWith('test error')
  })

  it('tags falls back to empty array', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'token':
          return 'token'
        case 'tags':
          return ''
        case 'environments':
          return 'env1\nenv2\nenv3'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenCalledWith(
      'environments',
      JSON.stringify([])
    )
  })
})
