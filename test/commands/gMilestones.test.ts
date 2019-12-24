import {expect, test} from '@oclif/test'

describe('gMilestones', () => {
  test
  .stdout()
  .command(['gMilestones'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['gMilestones', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
