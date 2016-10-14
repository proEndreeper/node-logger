# node-logger
Almost all of this is completely based off of Oracle's java.util.logging package; however, only the core pieces needed for the logging system to work are fully implemented. This is more a framework to implement a logging system using the level system that is used by the java.util.logging package.

Also, as for the moment, sequence numbers for the LogRecords is just a value increased by 1 every time a record is created, which starts at the value of Number.MIN_SAFE_INTEGER.

README.md still needs to be finished.
