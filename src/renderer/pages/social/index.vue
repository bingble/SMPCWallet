<template>
  <div class="boxConntent1 container pt-30 relative">
    <el-tabs v-model="activeName" :tab-position="'left'" style="height: 600px;" @tab-click="handleClick">
      <el-tab-pane :label="$t('btn').addFriend" name="add">
        <div class="container">
          <el-breadcrumb separator-class="el-icon-arrow-right" class="mt-15 mb-25 relative">
            <el-breadcrumb-item :to="{ path: '/account' }">{{$t('title').accountList}}</el-breadcrumb-item>
            <el-breadcrumb-item>{{$t('btn').addFriend}}</el-breadcrumb-item>
          </el-breadcrumb>
          <div class="W300">
            <el-input placeholder="Username + @ + Node Name" size="mini" v-model="searchVal">
              <i slot="prefix" class="el-input__icon el-icon-search" @click="searchFrinds"></i>
            </el-input>
          </div>
          <div class="friend-list">
            <ul>
              <li class="item" v-for="(item, index) in searchList" :key="index">
                <div class="flex-bc">
                  <span class="font12">{{item.unIP}}</span>
                  <el-button type="primary" size="mini" @click="openAddFriend(item)">{{$t('btn').add}}</el-button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('label').friendList" name="list">
        <div class="container">
          <el-breadcrumb separator-class="el-icon-arrow-right" class="mt-15 mb-5 relative">
            <el-breadcrumb-item :to="{ path: '/account' }">{{$t('title').accountList}}</el-breadcrumb-item>
            <el-breadcrumb-item>{{$t('label').friendList}}</el-breadcrumb-item>
          </el-breadcrumb>
          <div class="friend-list">
            <ul>
              <li class="item" v-for="(item, index) in friendList" :key="index">
                <div class="flex-bc">
                  <span class="font12">{{item.unIP}}</span>
                  <el-button type="danger" size="mini" @click="openDelFriend(item)">{{$t('action').delete}}</el-button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog :title="$t('tip').name" :visible.sync="eDialog.del" width="30%" center>
      <p class="center">{{$t('tip').deleteFriend}}</p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="modalClick">{{$t('btn').cancel}}</el-button>
        <el-button type="primary" @click="delFriend">{{$t('btn').confirm}}</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="$t('tip').name" :visible.sync="eDialog.add" width="30%" center>
      <p class="center">{{$t('tip').addFriend}}</p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="modalClick">{{$t('btn').cancel}}</el-button>
        <el-button type="primary" @click="addFriend">{{$t('btn').confirm}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss">
.friend-list {
  .item {
    width: 100%;padding: 10px 0;color: #999;border-bottom: 1px solid #ddd;
  }
}
</style>

<script>
import {computedPub} from '@/assets/js/pages/public'
import {nodeDatas, nodeSockets, nodeMethods} from '@/assets/js/pages/node/index.js'
export default {
  name: 'social',
  data () {
    return {
      ...nodeDatas,
      activeName: 'add',
      searchVal: '',
      searchList: [],
      friendList: [],
      eDialog: {
        del: false,
        add: false
      },
      addObj: {},
      delObj: {},
    }
  },
  computed: {
    ...computedPub,
  },
  sockets: {
    ...nodeSockets,
    UserFriendFind (res) {
      console.log(res)
      if (res.msg ='Success') {
        this.friendList = res.info
      } else {
        this.friendList = []
      }
    },
    UserEnodeSearch (res) {
      console.log(res)
      if (res.msg === 'Success') {
        this.searchList = res.info
      } else {
        this.searchList = []
        this.msgWarning(this.$t('warn').w_25)
      }
    },
    UserFriendAdd (res) {
      console.log(res)
      if (res.msg === 'Success') {
        this.msgSuccess(this.$t('success').s_8)
      } else {
        this.msgError(res.error)
      }
      this.modalClick()
      this.init()
    },
    UserFriendRemove (res) {
      console.log(res)
      if (res.msg === 'Success') {
        this.msgSuccess(this.$t('success').s_5)
      } else {
        this.msgError(res.error)
      }
      this.modalClick()
      this.init()
    },
  },
  mounted () {
    this.init()
  },
  methods: {
    ...nodeMethods,
    init () {
      this.getFriends()
      this.getNetUrl()
      this.initTabView()
    },
    modalClick () {
      this.eDialog.add = false
      this.eDialog.del = false
      this.delObj = {}
      this.addObj = {}
    },
    handleClick () {
      this.$router.push({path: this.$route.path, query: {activeTab: this.activeName}})
    },
    initTabView () {
      let at = this.$route.query.activeTab ? this.$route.query.activeTab : 'add'
      this.activeName = at
    },
    getFriends () {
      this.$socket.emit('UserFriendFind', {address: this.address})
    },
    searchFrinds () {
      this.$socket.emit('UserEnodeSearch', {searchVal: this.searchVal})
    },
    openAddFriend (item) {
      this.addObj = item
      this.eDialog.add = true
    },
    addFriend () {
      let ipName = this.serverRPC
      for (let obj of this.netUrlArr) {
        if (this.serverRPC === obj.url) {
          ipName = obj.name
          break
        }
      }
      if (this.addObj .unIP === (this.token + '@' + ipName)) {
        this.msgError(this.$t('error').err_17)
        this.modalClick()
        return
      }
      this.$socket.emit('UserFriendAdd', {
        username: this.token,
        address: this.address,
        ip: this.serverRPC,
        unIP: this.addObj .unIP,
      })
    },
    openDelFriend (item) {
      this.delObj = item
      this.eDialog.del = true
    },
    delFriend () {
      this.$socket.emit('UserFriendRemove', {
        address: this.address,
        unIP: this.delObj.unIP,
      })
    }
  }
}
</script>