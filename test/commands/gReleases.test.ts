import {expect, test} from '@oclif/test'

describe('gReleases', () => {
  test
  .stdout()
  .command(['gReleases'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['gReleases', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
