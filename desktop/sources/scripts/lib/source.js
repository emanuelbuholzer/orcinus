class Source {

  readFileSource(inputFile) {
    return new Promise(resolve => {
      const resolveWithContent = file =>
          file.text().then(content => resolve({
        name: file.name,
        content: content
      }));

      if (inputFile === undefined) {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = false;
        input.accept = '.orc'

        input.addEventListener('change', (event) => {
          event.preventDefault();

          const files = event.target.files;
          if (files.length !== 1) {
            throw new Error("loadFile did not receive one file");
          }
          const file = files[0];

          resolveWithContent(file);
        });

        input.click();
      } else {
        resolveWithContent(inputFile);
      }
    });
  }

  writeFileSource(source) {
    const blob = new Blob([source], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = (() => {
      const vowels = 'aeiou', consonants = 'bcdfghjklmnpqrstvwxyz';
      let word = '';
      for (let i = 0; i < 5; i++) {
        if (i % 2) {
          word += consonants[Math.floor(Math.random()*consonants.length)]
        } else {
          word += vowels[Math.floor(Math.random()*vowels.length)]
        }
      }
      return `patch-${word}.orc`;
    })();

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  readLocalStorageSources() {
    let sources = localStorage.getItem("sources");
    if (sources === undefined || sources === null) {
      sources = {};
    } else {
      sources = JSON.parse(sources);
    }
    return sources;
  }

  readLocalStorageSource(key) {
    return this.readLocalStorageSources()[key]
  }

  writeLocalStorageSource(key, source) {
    let sources = localStorage.getItem("sources");
    if (sources === undefined || sources === null) {
      sources = {};
    } else {
      sources = JSON.parse(sources);
    }

    sources[key] = source;
    localStorage.setItem("sources", JSON.stringify(sources));
  }

  writeHashSource(source) {
    window.location.hash = `#${encodeURIComponent(source)}`;
  }

  readHashSource() {
    const hash = window.location.hash;
    if (hash.length > 0) {
      return decodeURIComponent(hash.substring(1));
    }
  }
}
