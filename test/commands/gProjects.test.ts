import {expect, test} from '@oclif/test'

describe('gProjects', () => {
  test
  .stdout()
  .command(['gProjects'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['gProjects', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
