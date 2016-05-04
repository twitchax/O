// Metadata:
    // O.js v1.0.
    // Author: Aaron Roney.

// License:

    // The MIT License (MIT)

    // Copyright (c) 2016 Aaron Roney

    // Permission is hereby granted, free of charge, to any person obtaining a copy
    // of this software and associated documentation files (the "Software"), to deal
    // in the Software without restriction, including without limitation the rights
    // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    // copies of the Software, and to permit persons to whom the Software is
    // furnished to do so, subject to the following conditions:

    // The above copyright notice and this permission notice shall be included in all
    // copies or substantial portions of the Software.

    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    // SOFTWARE.

// TODO:
    // Modularize.

;'use strict';

;(function() {
    
    // Signifies that an object is "realizable" via "$value()".
    class _Realizable_Base {
        $value() {
            throw Error('Subclass does not properly override "$value".');
        }
    }
    
    // Proxy handler that allows method call passthrough.
    var _O_Impl_Base_Proxy_Handler = {
        
        // Example: "O.someProp(value)" would result in target = O and name = "someProp".
        get: function(target, name) {
            if(target[name])
                return target[name];
            
            // The beauty of O.  "O.literallyAnything" resolves to this returned setter function.
            return function(value) {
                return target.$set(name, value);
            };
        }, 
        
        // Example: "O(someExistingObjectToWrap)".
        apply: function(target, thisArg, argumentsList) {
            var objectToWrap = argumentsList[0];
            
            if(objectToWrap instanceof _Realizable_Base)
                objectToWrap = objectToWrap.$value();
                
            if(!(objectToWrap instanceof Object))
                throw Error('Must initialize "O" with an array or an instance of "O".');
            
            return new target.constructor(objectToWrap);
        }
    };

    // Base class for "O" that provides all logic.
    class O_Impl_Base extends _Realizable_Base {
    
        constructor(root, path) {
            super();
            
            if (!root)
                root = {};
            this._$root = root;
            
            if (!path)
                path = [];
            this._$path = path;
            
            return this._$createProxy();
        }
        
        ///////////////////////////////////////
        // Private helper properties.
        ///////////////////////////////////////
        
        // Gets a deep copy of the last state and makes a "working" copy.
        get _$working() {
            if(this._$workingCopy)
                return this._$workingCopy;
            return this._$workingCopy = { _$root: Object.assign({}, this._$root), _$path: Object.assign([], this._$path) };
        }
        
        // Gets the location in the wrapped object along this._path.
        get _$workingLocation() {
            var loc = this._$working._$root;
            for(var path of this._$working._$path)
                loc = loc[path];
            return loc;
        }
        
        // Returns the "working" copy and clears the working copy.
        _$wrapWorking() {
            var result = new this.constructor(Object.assign({}, this._$workingCopy._$root), Object.assign([], this._$workingCopy._$path));
            this._$workingCopy = undefined;
            return result;
        }
        
        ///////////////////////////////////////
        // Private proxying methods.
        ///////////////////////////////////////
        
        // Create a proxy for passthrough.
        _$createProxy() {
            return new Proxy(this, _O_Impl_Base_Proxy_Handler);
        }
        
        ///////////////////////////////////////
        // Private logic methods.
        ///////////////////////////////////////
        
        // Sets a certain property name to a value at the current this._path.
        _$set(propertyName, propertyValue) {
            if(propertyValue === undefined)
                return this._$enter(propertyName);
                
            if(propertyValue instanceof _Realizable_Base)
                propertyValue = propertyValue.$value();
                
            this._$workingLocation[propertyName] = propertyValue;
        }
        
        // "Enters" an object by, creating it if necessary, and moving into it
        _$enter(propertyName) {
            if(this._$workingLocation[propertyName]) {
                if(this._$workingLocation[propertyName] instanceof Object)
                    throw Error('Invalid "enter" path.');
            }
            else 
                this._$workingLocation[propertyName] = {};
                
            this._$working._$path.push(propertyName);
        }
        
        // "Leaves" the current this._path context.
        _$leave() {
            if(this._$working._$path.length === 0) 
                throw Error('Mismatch in "enter"/"leave".');
            this._$working._$path.pop();
        }
        
        // Build some property/values in the current this._path context with data and a functor.
        _$from(data, func) {
            for(var k in data) {
                var res = func(data[k], k, data);
                
                if(res instanceof Object && res.hasOwnProperty('property') && res.hasOwnProperty('value'))
                    var {property, value} = res;
                else if(res instanceof Array && res.length === 2)
                    var [property, value] = res;
                else
                    throw Error('Functor does not return proper "{property, value}" pair.');
                    
                this._$set(property, value);
            }
        }
        
        // Clears entire wrapped object.
        _$clear() {
            this._$working._$root = {}; 
            this._$working._$path = [];
        }
        
        // Sets the current context to the root.
        _$toRoot() {
            this._$working._$path = [];
        }
    }

    class O_Impl extends O_Impl_Base {
        
        ///////////////////////////////////////
        // Public methods.
        ///////////////////////////////////////
        
        $set(propertyName, propertyValue) {
            this._$set(propertyName, propertyValue);
            return this._$wrapWorking();
        }
        $with(propertyName, propertyValue) {
            return this.$set(propertyName, propertyValue);
        }
        
        $enter(propertyName) {
            this._$enter(propertyName);
            return this._$wrapWorking();
        }
        
        $leave() {
            this._$leave();
            return this._$wrapWorking();
        }
        
        $from(data, func) {
            this._$from(data, func);
            return this._$wrapWorking();
        }
        
        $clear() {
            this._$clear();
            return this._$wrapWorking();
        }
        
        $toRoot() {
            this._$toRoot();
            return this._$wrapWorking();
        }
        
        $value() {
            return this._$root;
        }
    }
    
    // Export "O".
    var O = window.O = new O_Impl();
    
    // Proxy handler that allows method call passthrough.
    var _A_Impl_Base_Proxy_Handler = {
        apply: function(target, thisArg, argumentsList) {
            var arrayToWrap = argumentsList[0];
            
            if(arrayToWrap instanceof _Realizable_Base)
                arrayToWrap = arrayToWrap.$value();
                
            if(!(arrayToWrap instanceof Array))
                throw Error('Must initialize "A" with an array or an instance of "A".');
            
            return new target.constructor(arrayToWrap);
        }
    };
    
    // Base class for "A" that contains all logic.
    class A_Impl_Base extends _Realizable_Base {
    
        constructor(array) {
            super();
            
            if (!array)
                array = [];
            this._$array = array;
            
            return this._$createProxy();
        }
        
        ///////////////////////////////////////
        // Private helper properties.
        ///////////////////////////////////////
        
        // Gets a deep copy of the last state and makes a "working" copy.
        get _$working() {
            if(this._$workingCopy)
                return this._$workingCopy;
            return this._$workingCopy = { _$array: Object.assign([], this._$array) };
        }
        
        // Returns the "working" copy.
        _$wrapWorking() {
            var result = new this.constructor(Object.assign([], this._$workingCopy._$array));
            this._$workingCopy = undefined;
            return result;
        }
        
        ///////////////////////////////////////
        // Private proxying methods.
        ///////////////////////////////////////
        
        // Create a proxy for passthrough.
        _$createProxy() {
            return new Proxy(this, _A_Impl_Base_Proxy_Handler);
        }
        
        ///////////////////////////////////////
        // Private helper methods.
        ///////////////////////////////////////
        
        // Adds an item to the wrapped array.
        _$item(value) {
            if(value instanceof _Realizable_Base)
                value = value.$value();
                
            this._$working._$array.push(value);
        }
        
        // Build and add some items with data and a functor.
        _$from(data, func) {
            for(var k in data) {
                var res = func(data[k], k, data);
                this._$item(res);
            }
        }
        
        // Clears entire wrapped array.
        _$clear() {
            this._$working._$array = [];
        }
    }

    class A_Impl extends A_Impl_Base {
        
        ///////////////////////////////////////
        // Public methods.
        ///////////////////////////////////////
        
        $item(value) {
            this._$item(value);
            return this._$wrapWorking();
        }
        $(value) {
            return this.$item(value);
        }
        
        $from(data, func) {
            this._$from(data, func);
            return this._$wrapWorking();
        }
        
        $clear() {
            this._$clear();
            return this._$wrapWorking();
        }
        
        $value() {
            return this._$array;
        }
    }

    // Export "A".
    var A = window.A = new A_Impl();
    
})();