{
  "targets": [
    {
      "target_name": "vlejs",
      "sources": [ "wrapper.cpp" ],
      "include_dirs": [
        "/home/eric/usr/include/vle-1.2",
	    "/usr/include/libxml2",
	    "/usr/include/glibmm-2.4",
	    "/usr/lib/x86_64-linux-gnu/glibmm-2.4/include",
	    "/usr/include/glib-2.0",
	    "/usr/lib/x86_64-linux-gnu/glib-2.0/include",
	    "/usr/include/sigc++-2.0",
	    "/usr/lib/x86_64-linux-gnu/sigc++-2.0/include"
      ],
      "libraries": [
        "-L/home/eric/usr/lib",
	    "-lvle-1.2", "-lxml2", "-lglibmm-2.4", "-lgobject-2.0",
	    "-lglib-2.0", "-lsigc-2.0"
      ],
      "cflags!": [ '-fno-exceptions' ],
      "cflags": [ "-std=c++11" ],
      "cflags_cc!": [ "-fno-exceptions", "-fno-rtti" ]
    }
  ]
}