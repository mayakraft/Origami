// this method allows you to attach an outside library to this one

const use = function (library) {
  if (typeof library !== "function"
    || library === null
    || typeof library.linker !== "function") {
    return;
  }
  library.linker(this);
};

export default use;