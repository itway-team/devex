#!/bin/bash

. ./env.sh


$FT multisig transfer 1 --from user3 --to EulerRoot submit '{ "problem": %{env:EULER_PROBLEM}, "proof": "%{file:proof.bin.hex}", "pubkey": "0x%{account:pubkey:user3}" }' --wait || exit 2

$FT call --local euler_problem get

# wrong solution:

$FT exec -- ../cpp/euler-client prove ${EULER_PROBLEM} ${EULER_NONCE}  ${EULER_SOLUTION}0 '%{account:pubkey:user3}' && echo OK

$FT call --local euler_problem get    
