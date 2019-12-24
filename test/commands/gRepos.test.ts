import {expect, test} from '@oclif/test'

describe('gRepos', () => {
  test
  .stdout()
  .command(['gRepos'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['gRepos', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
