import db from '@/db/db.js'

function updateGroup (data) {
  if (!data.gId) return
  const params = {
    gId: data.gId,
    name: data.name,
    updatetime: Date.now()
  }
  return new Promise((resolve, reject) => {
    db.group.update({gId: data.gId}, params, {upsert: true}, (err, res) => {
      if (err) {
        // console.log(err)
        reject(err)
      } else {
        // console.log(res)
        resolve(res)
      }
    })
  })
}

function findGroup (params) {
  params = params ? params : {}
  return new Promise((resolve, reject) => {
    // console.log(params)
    db.group.find(params).sort({ timestamp: -1 }).exec((err, res) => {
      if (err) {
        // console.log(err)
        reject(err)
      } else {
        // console.log(res)
        resolve(res)
      }
    })
  })
}

function removeGroup (params) {
  params = params ? params : {}
  return new Promise((resolve, reject) => {
    // console.log(params)
    db.group.remove(params, {}, (err, res) => {
      if (err) {
        // console.log(err)
        reject(err)
      } else {
        // console.log(res)
        resolve(res)
      }
    })
  })
}

export {
  updateGroup,
  findGroup,
  removeGroup
}