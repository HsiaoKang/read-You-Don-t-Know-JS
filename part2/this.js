// 显示绑定
(function bind() {
  function a (){
    console.log(this.text);
  }
  let text = 'global'

  let obj = {
    text:'obj'
  }

  a.apply(obj)
})()

// 箭头函数
(function () {
  func = function () {
    return ()=>{
      console.log(this.a)
    }
  }

  obj = {a:'obj'}
  obj2 = {a:'obg2'}
  a = func.call(obj)
  a.call(obj2)
})()
