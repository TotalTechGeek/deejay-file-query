// @ts-check

// Test with: 
// deejay -i from -e examples/extension.js -f custom -a '1,2,3'

import { from } from 'rxjs'
export const inputs = {
    from: (_, additional) => from((additional || '').split(','))
}

export const setup = (engine) => {
    engine.addMethod('test', () => 1)
    return engine
}