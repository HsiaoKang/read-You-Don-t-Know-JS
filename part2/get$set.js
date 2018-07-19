var myObject = {
    get a(){
        // 这个 _a_ 只是一个变量，用来存储set a 的值
        return this._a_
    },
    // 加入set
    set a(val){
        this._a_ = val
    }
}
Object.defineProperty(myObject,'b',{
    // 描述符
    // 给b一个描述符
    get:function () {
        return this.a * 2
    },
    // 确保b会出现在对象的属性列表中
    enumerable: true
})


myObject.a = 1  // 没有set时，被忽略了


console.log(myObject.a)
console.log(myObject.b)
console.log('set')
// Object.defineProperty(myObject,'b',{
//     set:function (value) {
//         this._b_ = value
//     },
//     enumerable:true
// })

myObject.a =  'new'

console.log(myObject.a)