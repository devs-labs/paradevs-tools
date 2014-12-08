{
  "targets": [
    {
      "target_name": "vlejs",
      "sources": [ "wrapper.cpp" ],
      "include_dirs": [ "<!@(pkg-config vle-1.2 --cflags-only-I | sed s/-I//g)" ],
      "libraries": [ "<!@(pkg-config vle-1.2 --libs)" ],
      "cflags!": [ '-fno-exceptions' ],
      "cflags": [ "-std=c++11" ],
      "cflags_cc!": [ "-fno-exceptions", "-fno-rtti" ]
    }
  ]
}