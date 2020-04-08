const checkFileType = {
  methods: {
    checkFile(file,acceptStr) {
      let lastName = file.split('.')
      let newAcceptStr = acceptStr.split(',').length && acceptStr.split(',').map(v => {return v.toLowerCase()}) || ''
      if (newAcceptStr.indexOf(('.'+lastName[lastName.length-1].toLowerCase()))==-1) {
        this.$message("请上传正确类型的文件");
        return false;
      }
      return true;
    }
  }
}
export {
  checkFileType
};
