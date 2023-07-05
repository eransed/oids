import { Physical } from './traits/Physical'
import { testModule, TestModuleResults, testSummary } from './traits/Testable'

export function test(): boolean {
 const results: TestModuleResults[] = [
  testModule(new Physical().getTestModule()),
  // testModule(new Renderable().getTestModule()),
 ]

 return testSummary(results)
}
