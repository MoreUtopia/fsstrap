# fsstrap

An actually good build-system for bootstraping Utopia-based initramfses using Debian's packages.

I've used AI for some boring tasks.

## Why?

While tools like [xbstrap](https://github.com/managarm/xbstrap) exist, they are generally built for operating systems having a specific way of building / needing to patch software in order for it to work. As Utopia pretty much mostly works like *drop Linux exectuable with its dependencies and it should work*, that approach wastes a lot of time on creating configs. So `fsstrap` does one thing and does it well - downloads Debian packages with their dependencies and creates a stub init with Utopia syscall ABI that launches the given executable.
