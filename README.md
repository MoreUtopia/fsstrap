# fsstrap

An actually good build-system for bootstraping [Utopia](https://github.com/gorciu-official/Utopia)-based initramfses using Debian's packages. Syntax heavily inspired by [CMake](https://cmake.org/).

An example `Fsstrapfile` can be found [in this repository](Fsstrapfile). 

## Why?

While tools like [jinx](https://github.com/Mintsuki/Jinx) or [xbstrap](https://github.com/managarm/xbstrap) exist, they are generally built for operating systems having a specific way of building / needing to patch software in order for it to work. As Utopia pretty much mostly works like *drop Linux exectuable with its dependencies and it should work*, that approach wastes a lot of time on creating configs. So `fsstrap` does one thing and does it well - downloads Debian packages with their dependencies and creates a stub init with Utopia syscall ABI that launches the given executable.

## Notes

There was some AI used in this project.
