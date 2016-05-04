'use strict';

;(function() {

    var _O_Impl_Base_Proxy_Handler = {
        get: function(target, name) {
            if(target[name])
                return target[name];
                
            return function(value) {
                return target.$set(name, value);
            };
        }, 
        apply: function(target, thisArg, argumentsList) {
            return new target.constructor(argumentsList[0]);
        }
    };

    class O_Impl_Base {
    
        constructor(root, path) {
            if (!root)
                root = {};
            this._$root = root;
            
            if (!path)
                path = [];
            this._$path = path;
            
            return this._$createProxy();
        }
        
        // Private helper properties.
        
        // Gets a deep copy of the last state and makes a "working" copy.
        get _$working() {
            if(this._$workingCopy)
                return this._$workingCopy;
            return this._$workingCopy = { _$root: Object.assign({}, this._$root), _$path: Object.assign([], this._$path) };
        }
        
        get _$workingLocation() {
            var loc = this._$working._$root;
            for(var path of this._$working._$path)
                loc = loc[path];
            return loc;
        }
        
        // Returns the "working" copy.
        _$wrapWorking() {
            var result = new this.constructor(Object.assign({}, this._$workingCopy._$root), Object.assign([], this._$workingCopy._$path));
            this._$workingCopy = undefined;
            return result;
        }
        
        // Private proxying methods.
        
        // Create a proxy for pass-through.
        _$createProxy() {
            return new Proxy(this, _O_Impl_Base_Proxy_Handler);
        }
        
        // Private helper methods.
        
        _$set(propertyName, propertyValue) {
            if(propertyValue === undefined)
                return this._$enter(propertyName);
                
            if(typeof propertyValue === 'object' && (propertyValue.constructor.name === 'O_Impl' || propertyValue.constructor.name === 'A_Impl'))
                propertyValue = propertyValue.$value();
                
            this._$workingLocation[propertyName] = propertyValue;
        }
        
        _$enter(propertyName) {
            if(this._$workingLocation[propertyName]) {
                if(typeof this._$workingLocation[propertyName] !== 'object')
                    throw Error('Invalid "enter" path.');
            }
            else 
                this._$workingLocation[propertyName] = {};
                
            this._$working._$path.push(propertyName);
        }
        
        _$leave() {
            if(this._$working._$path.length === 0) 
                throw Error('Mismatch in "enter"/"leave".');
            this._$working._$path.pop();
        }
        
        _$clear() {
            this._$working._$root = {}; 
            this._$working._$path = [];
        }
        
        _$toRoot() {
            this._$working._$path = [];
        }
    }


    class O_Impl extends O_Impl_Base {
        
        // Public methods.
        
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
        
        $clear() {
            this._$clear();
            return this._$wrapWorking();
        }
        
        $toRoot() {
            this._$toRoot();
            return this._$wrapWorking();
        }
        
        // Realization method.
        $value() {
            return this._$root;
        }
    }

    var O = window.O = new O_Impl();
    
    var _A_Impl_Base_Proxy_Handler = {
        // get: function(target, name) {
        //     if(target[name])
        //         return target[name];
                
        //     return function(value) {
        //         return target.$set(name, value);
        //     };
        // }, 
        apply: function(target, thisArg, argumentsList) {
            return new A_Impl(argumentsList[0]);
        }
    };
    
    class A_Impl_Base {
    
        constructor(array) {
            if (!array)
                array = [];
            this._$array = array;
            
            return this._$createProxy();
        }
        
        // Private helper properties.
        
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
        
        // Private proxying methods.
        
        // Create a proxy for pass-through.
        _$createProxy() {
            return new Proxy(this, _A_Impl_Base_Proxy_Handler);
        }
        
        // Private helper methods.
        
        _$item(value) {
            if(typeof propertyValue === 'object' && (propertyValue.constructor.name === 'O_Impl' || propertyValue.constructor.name === 'A_Impl'))
                value = value.$value();
                
            this._$working._$array.push(value);
        }
        
        _$clear() {
            this._$working._$array = [];
        }
    }


    class A_Impl extends A_Impl_Base {
        
        // Public methods.
        
        $item(value) {
            this._$item(value);
            return this._$wrapWorking();
        }
        $(value) {
            return this.$item(value);
        }
        
        $clear() {
            this._$clear();
            return this._$wrapWorking();
        }
        
        // Realization method.
        $value() {
            return this._$array;
        }
    }

    var A = window.A = new A_Impl();
    
    // Export.
    
    // if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    //     define(function() {
    //         return { O: O, A: A };
    //     });
    // }
    
})();

// TODO:
// Add "$from" method for both "O" and "A".
// TEST and add to SAS.
// Modularize (copy lodash).

// TEST: O.x(1).y(2).$enter('a').b(65).$leave()['sexy']('time').$enter('c').d(function() { console.log('ddddd'); }).$toRoot().awesome(O.zebra(4)).$value();