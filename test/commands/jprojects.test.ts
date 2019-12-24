import {expect, test} from '@oclif/test'

describe('jprojects', () => {
  test
  .stdout()
  .command(['jprojects'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['jprojects', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
