import {expect, test} from '@oclif/test'

describe('gIssues', () => {
  test
  .stdout()
  .command(['gIssues'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['gIssues', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
