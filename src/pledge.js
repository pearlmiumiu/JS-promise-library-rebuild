// 'use strict';
// /*----------------------------------------------------------------
// Promises Workshop: build the pledge.js ES6-style promise library
// ----------------------------------------------------------------*/



function $Promise(executor){
	if (typeof executor !== "function"){
		let message="executor should be a function";
		throw TypeError(message);

	}
	this._state="pending";
	this._handlerGroups=[];
	executor(this._internalResolve.bind(this), this._internalReject.bind(this))
}

$Promise.prototype._internalResolve=function(value){
	this._settle('fulfilled', value);

};

$Promise.prototype._internalReject = function(value){
	this._settle('rejected', value);
};

$Promise.prototype._settle = function(state,value) {

	if (this._state==='pending'){
		this._state=state;
		this._value=value;
		this._callHandlers();
	}
	
};




const isFn=val=>typeof val==='function';
$Promise.prototype.then = function(successCb, errorCb) {
	const group =
	{
		successCb: isFn(successCb)? successCb:undefined, 
		errorCb:isFn(errorCb)? errorCb:undefined,
		downstreamPromise: new $Promise(function(){})
	};
	this._handlerGroups.push(group);
	this._callHandlers();
	return group.downstreamPromise;
};



$Promise.prototype._callHandlers=function(){
	const pA=this;
	if (pA._state !=='pending'){

	
	 pA._handlerGroups.forEach(group=>{
	 	const pB=group.downstreamPromise;
	 	const handler=pA._state==='fulfilled'
	 	? group.successCb
	 	: group.errorCb;
		if (!handler) {
			if (pA._state==='fulfilled') pB._internalResolve(pA._value)
			else pB._internalReject(pA._value)
		  
		}else {
			try{
				const result=handler(pA._value);
				if (result instanceof $Promise){
					const pZ=result;
					pZ.then(
						pB._internalResolve.bind(pB),
						pB._internalReject.bind(pB)
						//data=> pB._internalResolve(data),
						// reason=>pB._internalReject(reason)

					)

				}else pB._internalResolve(result);
			}catch(err){
				pB._internalReject(err)
			}
		 
		}
	});
     this._handlerGroups=[];
	}
};



$Promise.prototype.catch= function(errorCb){

  return this.then(null, errorCb);
}










// /*-------------------------------------------------------
// The spec was designed to work with Test'Em, so we don't
// actually use module.exports. But here it is for reference:

// module.exports = $Promise;

// So in a Node-based project we could write things like this:

// var Promise = require('pledge');
// …
// var promise = new Promise(function (resolve, reject) { … });
// --------------------------------------------------------*/
