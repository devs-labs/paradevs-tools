#include <node.h>
#include <v8.h>

#include <vle/utils/Trace.hpp>
#include <vle/utils/Package.hpp>
#include <vle/utils/i18n.hpp>
#include <vle/vle.hpp>
#include <cstdlib>
#include <iostream>
#include <fstream>
#include <boost/program_options.hpp>

namespace po = boost::program_options;

using namespace v8;

typedef std::vector < std::string > CmdArgs;

struct VLE
{
  vle::Init app;

  VLE(int verbose, int trace)
  {
    vle::utils::Trace::setLevel(vle::utils::Trace::cast(verbose));

    if (trace < 0)
      vle::utils::Trace::setStandardError();
    else if (trace > 0)
      vle::utils::Trace::setStandardOutput();
    else
      vle::utils::Trace::setLogFile(
				    vle::utils::Trace::getDefaultLogFilename());
  }

  ~VLE()
  {
    if (vle::utils::Trace::haveWarning() &&
	vle::utils::Trace::getType() == vle::utils::TRACE_STREAM_FILE)
      std::cerr << vle::fmt(
			    "\n/!\\ Some warnings during run: See file %1%\n") %
	vle::utils::Trace::getLogFile() << std::endl;
  }
};

static bool init_package(vle::utils::Package& pkg, const CmdArgs &args)
{
  if (not pkg.existsBinary()) {
    if (not pkg.existsSource()) {
      if (std::find(args.begin(), args.end(), "create") == args.end()) {
	std::cerr << vle::fmt(
			      _("Package `%1%' does not exist. Use the create command"
				" before other command.\n")) % pkg.name();

	return false;
      }
    }
  }
  return true;
}

static int manage_package_mode(const std::string &packagename, bool manager,
                               int processor, const CmdArgs &args)
{
  CmdArgs::const_iterator it = args.begin();
  CmdArgs::const_iterator end = args.end();
  bool stop = false;

  vle::utils::Package pkg(packagename);

  if (not init_package(pkg, args))
    return EXIT_FAILURE;

  for (; not stop and it != end; ++it) {
    if (*it == "create") {
      try {
	pkg.create();
      } catch (const std::exception &e) {
	std::cerr << vle::fmt("Cannot create package: %1%")
	  % e.what()
		  << std::endl;
	stop = true;
      }

    } else if (*it == "configure") {
      pkg.configure();
      pkg.wait(std::cerr, std::cerr);
      stop = not pkg.isSuccess();
    } else if (*it == "build") {
      pkg.build();
      pkg.wait(std::cerr, std::cerr);
      if (pkg.isSuccess()) {
	pkg.install();
	pkg.wait(std::cerr, std::cerr);
      }
      stop = not pkg.isSuccess();
    } else if (*it == "test") {
      pkg.test();
      pkg.wait(std::cerr, std::cerr);
      stop = not pkg.isSuccess();
    } else if (*it == "install") {
      pkg.install();
      pkg.wait(std::cerr, std::cerr);
      stop = not pkg.isSuccess();
    } else if (*it == "clean") {
      pkg.clean();
    } else if (*it == "rclean") {
      pkg.rclean();
    } else if (*it == "package") {
      pkg.pack();
      pkg.wait(std::cerr, std::cerr);
      stop = not pkg.isSuccess();
    } else if (*it == "all") {
      std::cerr << "all is not yet implemented\n";
      stop = true;
    } else if (*it == "depends") {
      std::cerr << "Depends is not yet implemented\n";
      stop = true;
    } else if (*it == "list") {
      //            show_package_content(pkg);
    } else {
      break;
    }
  }

  int ret = EXIT_SUCCESS;

  if (stop)
    ret = EXIT_FAILURE;
  else if (it != end) {
    /*        if (manager)
	      ret = run_manager(it, end, processor, pkg);
	      else
	      ret = run_simulation(it, end, pkg); */
  }

  return ret;
}

struct Comma:
  public std::binary_function < std::string, std::string, std::string >
{
  std::string operator()(const std::string &a, const std::string &b) const
  {
    if (a.empty())
      return b;

    return a + ',' + b;
  }
};

enum ProgramOptionsCode
  {
    PROGRAM_OPTIONS_FAILURE = -1,
    PROGRAM_OPTIONS_END = 0,
    PROGRAM_OPTIONS_PACKAGE = 1,
    PROGRAM_OPTIONS_REMOTE = 2,
    PROGRAM_OPTIONS_CONFIG = 3,
  };

struct ProgramOptions
{
  ProgramOptions(int *verbose, int *trace, int *processor,
		 bool *manager_mode, std::string *packagename,
		 std::string *remotecmd, std::string *configvar, CmdArgs *args)
    : generic(_("Allowed options")), hidden(_("Hidden options")),
      verbose(verbose), trace(trace), processor(processor),
      manager_mode(manager_mode), packagename(packagename),
      remotecmd(remotecmd), configvar(configvar), args(args)
  {
    generic.add_options()
      ("package,P", po::value < std::string >(packagename),
       _("Select package mode,\n  package name [options]...\n"
	 "vle -P foo create: build new foo package\n"
	 "vle -P foo configure: configure the foo package\n"
	 "vle -P foo build: build the foo package\n"
	 "vle -P foo test: start a unit test campaign\n"
	 "vle -P foo install: install libs\n"
	 "vle -P foo clean: clean up the build directory\n"
	 "vle -P foo rclean: delete binary directories\n"
	 "vle -P foo package: build packages\n"
	 "vle -P foo all: build all depends of foo package\n"
	 "vle -P foo depends: list depends of foo package\n"
	 "vle -P foo list: list vpz and library package"))
      ;

    hidden.add_options()
      ("input", po::value < CmdArgs >(), _("input"))
      ;

    desc.add(generic).add(hidden);
  }

  ~ProgramOptions()
  {
  }

  int run(int argc, char *argv[])
  {
    po::positional_options_description p;
    p.add("input", -1);

    try {
      po::store(po::command_line_parser(argc,
					argv).options(desc).positional(p).run(), vm);
      po::notify(vm);

      if (vm.count("input"))
	*args = vm["input"].as < CmdArgs >();

      if (vm.count("package"))
	return PROGRAM_OPTIONS_PACKAGE;
    } catch (const std::exception &e) {
      std::cerr << e.what() << std::endl;
      return PROGRAM_OPTIONS_FAILURE; 
    }
    return PROGRAM_OPTIONS_END;
  }

  po::options_description desc, generic, hidden;
  po::variables_map vm;
  int *verbose, *trace, *processor;
  bool *manager_mode;
  std::string *packagename, *remotecmd, *configvar;
  CmdArgs *args;
};

typedef char* charPtr;

Handle<Value> create(const Arguments& jsargs)
{
  HandleScope scope;

  int ret;
  int verbose = 0;
  int processor = 1;
  int trace = -1; /* < 0 = stderr, 0 = file and > 0 = stdout */
  bool manager_mode = false;
  std::string packagename, remotecmd, configvar;
  CmdArgs args;

  char** argv = new charPtr[jsargs.Length() + 1];

  {
    argv[0] = new char[4];
    strcpy(argv[0], "vle");

    for (int i = 0; i < jsargs.Length(); ++i) {
      Local<String> str = jsargs[i]->ToString();

      argv[i + 1] = new char[str->Length() + 1];      
      str->WriteAscii(argv[i + 1]);
    }
  }
  
  {
    ProgramOptions prgs(&verbose, &trace, &processor, &manager_mode,
			&packagename, &remotecmd, &configvar, &args);
    
    ret = prgs.run(jsargs.Length() + 1, argv);
  }
  
  VLE app(verbose, trace); /* We are in package, remote or configuration
			      mode, we need to initialize VLE's API. */
  
  switch (ret) {
  case PROGRAM_OPTIONS_PACKAGE:
    return scope.Close(Integer::New(manage_package_mode(packagename,
							manager_mode,
							processor, args)));
  default:
    break;
  };
  
  return scope.Close(Integer::New(EXIT_SUCCESS));
}

void init(Handle<Object> target) {
  target->Set(String::NewSymbol("create"),
	      FunctionTemplate::New(create)->GetFunction());
}

NODE_MODULE(vlejs, init)
