import {expect, test} from '@oclif/test'

describe('gLabels', () => {
  test
  .stdout()
  .command(['gLabels'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['gLabels', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
