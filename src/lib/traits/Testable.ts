export interface TestFunction {
 func: () => boolean
 desc: string
}

export interface TestModule {
 name: string
 moduleTestFunctions: TestFunction[]
}

export interface TestFunctionResult extends TestFunction {
 result: boolean
}

export class TestModuleResults implements TestModule {
 name: string
 moduleTestFunctions: TestFunction[]
 results: TestFunctionResult[] = []
 constructor(_name: string, _moduleTestFunctions: TestFunction[]) {
  this.name = _name
  this.moduleTestFunctions = _moduleTestFunctions
 }
}

export interface Testable {
 getTestModule(): TestModule
}

export function testModule(testModule: TestModule): TestModuleResults {
 const mfr: TestFunctionResult[] = []

 for (const tf of testModule.moduleTestFunctions) {
  const result = tf.func() === true

  mfr.push({
   desc: tf.desc,
   func: tf.func,
   result: result,
  })
 }
 return new TestModuleResults(testModule.name, mfr)
}

export function testSummary(tmr: TestModuleResults[]): boolean {
 // console.error('Some tests failed!')
 return true
}
