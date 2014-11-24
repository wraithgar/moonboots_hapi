test:
		@node node_modules/lab/bin/lab -c
test-no-cov:
		@node node_modules/lab/bin/lab

.PHONY: test test-no-cov
