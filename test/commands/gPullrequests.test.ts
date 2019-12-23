import {expect, test} from '@oclif/test'

describe('gPullrequests', () => {
  test
  .stdout()
  .command(['gPullrequests'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['gPullrequests', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
