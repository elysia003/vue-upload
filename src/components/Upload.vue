<template>
  <div id="global-uploader">
    <uploader
      ref="uploader"
      :options="options"
      :autoStart="false"
      @file-added="fileAdded"
      @files-added="filesAdded"
      @file-removed="fileRemoved"
      @file-success="fileSuccess"
      class="uploader-example"
    >
      <uploader-unsupport></uploader-unsupport>
      <uploader-drop>
        <p>Drop files here to upload or</p>
        <uploader-btn>select files</uploader-btn>
        <uploader-btn :attrs="attrs">select images</uploader-btn>
        <uploader-btn :directory="true">select folder</uploader-btn>
      </uploader-drop>
      <uploader-list>
        <div class="file-panel" slot-scope="props">
          <div class="file-title">
            <h2>文件列表</h2>
          </div>
          <ul class="file-list">
            <li style="list-style-type:none" v-for="file in props.fileList" :key="file.id">
              <uploader-file :class="'file_'" ref="files" :file="file" :list="true"></uploader-file>
              <el-dialog title="提示" id="from" :visible.sync="dialogVisible" width="30%"></el-dialog>
            </li>
            <div class="no-file" v-if="!props.fileList.length">
              <i class="nucfont inuc-empty-file"></i> 暂无待上传文件
            </div>
          </ul>
        </div>
      </uploader-list>
      <el-button type="primary" @click="start">{{upload_str}}</el-button>
    </uploader>
  </div>
</template>
<script>
import axios from 'axios'
import md5 from "js-md5";
import BMF from "browser-md5-file";
import SparkMD5 from "spark-md5";
export default {
  data() {
    return {
      dialogVisible: false,
      upload_str: "上传",
      form: {
        name: "",
        region: "",
        date1: "",
        date2: "",
        delivery: false,
        type: [],
        resource: "",
        desc: ""
      },
      flag: [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ],
      options: {
        // https://github.com/simple-uploader/Uploader/tree/develop/samples/Node.js
        target: "//localhost:9001/upload",
        testChunks: true,
        chunkSize: 10 * 1024 * 1024,
        testChunks: true,
        maxChunkRetries: 3,
        simultaneousUploads: 5
      },
      attrs: {
        accept: "image/*"
      }
    };
  },
  methods: {
    fileAdded(file) {
      file.pause();
      this.flag[file.id - 2] = 1;
      console.log(file);
      this.computeMD5(file);
    },
    filesAdded(files) {
      for (var i of files) {
        console.log(i.name);
      }
    },
    fileRemoved(file) {
      console.log(file.id + "RRRRRRRRRRRRRRRRRRRRR");
      this.flag[file.id - 2] = 0;
    },
    fileSuccess(rootFile, file, message, chunk) {
      document.querySelectorAll(".uploader-file-status")[
        file.id - 2
      ].firstChild.innerHTML = "合并中... ";
      console.log(file);
      axios
        .get("http://127.0.0.1:9001/hs", {
          // 还可以直接把参数拼接在url后边
          params: {
            totalChunks:file.chunks.length+1,
            identifier:file.uniqueIdentifier
          }
        })
        .then(function(res) {
          this.goodsList = res.data;
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    start() {
      const uploaderInstance = this.$refs.uploader.uploader;
      uploaderInstance.resume();
      //uploaderInstance.resume();
    },
    computeMD5(file) {
      var that = this;
      let fileReader = new FileReader();
      let time = new Date().getTime();
      let blobSlice =
        File.prototype.slice ||
        File.prototype.mozSlice ||
        File.prototype.webkitSlice;
      let currentChunk = 0;
      const chunkSize = 10 * 1024 * 1000;
      let chunks = Math.ceil(file.size / chunkSize);
      let spark = new SparkMD5.ArrayBuffer();
      let fl = 1;
      // 文件状态设为"计算MD5"
      //this.statusSet(file.id, "md5");
      file.pause();
      loadNext();
      fileReader.onload = e => {
        if (fl == 1) {
          var span = document.createElement("i"); //1、创建元素
          span.id = "dd" + file.id;
          span.classList.add("el-icon-edit");
          span.onclick = function() {
            parmrs(that, file.id);
          };
          document
            .querySelectorAll(".uploader-file-actions")
            [file.id - 2].appendChild(span);
          fl = 0;
        }
        spark.append(e.target.result);
        console.log(e.target.result)
        if (currentChunk < chunks) {
          currentChunk++;
          if (this.flag[file.id - 2] == 1) {
            loadNext();
            //console.log(document.querySelectorAll(".uploader-file-status")[file.id-2])
            document.querySelectorAll(".uploader-file-status")[
              file.id - 2
            ].firstChild.innerHTML =
              "准备中... " + ((currentChunk / chunks) * 100).toFixed(0) + "%";
            this.upload_str = "准备完成后上传";
          }
        } else {
          let md5 = spark.end();
          //this.computeMD5Success(md5, file);
          console.log(
            `MD5计算完毕：${file.name} \nMD5：${md5} \n分片：${chunks} 大小:${
              file.size
            } 用时：${new Date().getTime() - time} ms`
          );
          document.querySelectorAll(".uploader-file-status")[
            file.id - 2
          ].firstChild.innerHTML = "准备完成";
          file.pause();
          file.uniqueIdentifier = md5;
          this.upload_str = "上传";
        }
      };
      fileReader.onerror = function() {
        console.log(`文件${file.name}读取出错，请检查该文件`);
        file.cancel();
      };
      function loadNext() {
        let start = currentChunk * chunkSize;
        let end =
          ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end));
      }
      function parmrs(that, id) {
        const uploaderInstance = that.$refs.uploader.uploader;
        for (var i of uploaderInstance.files) {
          if (i.id == id) {
            console.log(i);
            break;
          }
        }
        that.form;
        that.dialogVisible = true;
      }
    }
  }
};
</script>
<style scoped>
</style>>