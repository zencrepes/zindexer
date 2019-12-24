import {expect, test} from '@oclif/test'

describe('jIssues', () => {
  test
  .stdout()
  .command(['jIssues'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['jIssues', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
