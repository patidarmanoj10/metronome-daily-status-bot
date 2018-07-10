/* global jest, describe, it, expect, beforeEach */

'use strict'

const sinon = require('sinon')
const web3Mock = require('./mocks/web3')
const metronomeContractsMock = require('./mocks/metronome-contracts')
const callAtMock = require('./mocks/call-at')

const logger = {
  info: sinon.spy(),
  debug: sinon.spy(),
  error: sinon.spy()
}

jest.doMock('../logger', () => ({
  info: logger.info,
  debug: logger.debug,
  error: logger.error
}))
jest.doMock('web3', () => web3Mock)
jest.doMock('metronome-contracts', () => metronomeContractsMock)
jest.doMock('../lib/call-at', () => callAtMock)

const monitor = require('../lib')

describe('Metronome daily auction monitor', function () {
  beforeEach(function () {
    logger.info.resetHistory()
    logger.debug.resetHistory()
    logger.error.resetHistory()
  })

  it('should have defaults variables initialized', function () {
    expect(typeof monitor).toBe('object')
    expect(typeof monitor.auction).toBe('object')
    expect(typeof monitor.timer).toBe('object')
    expect(monitor.isRunning).toBe(false)
    expect(monitor.auction.current).toBe(0)
    expect(monitor.auction.startedAt).toBe(null)
    expect(monitor.auction.endedAt).toBe(null)
    expect(monitor.auction.maxPrice).toBe(0)
    expect(monitor.auction.maxPriceUSD).toBe(0)
    expect(monitor.auction.minPrice).toBe(0)
    expect(monitor.auction.minPriceUSD).toBe(0)
  })

  it('should start the monitor', function () {
    return monitor.start()
      .then(function () {
        expect(monitor.isRunning).toBe(true)
        expect(monitor.auction.current).toBe(1)
        expect(typeof monitor.timer).toBe('number')
        expect(logger.info.calledTwice).toBe(true)
      })
  })

  it('should stop the monitor', function () {
    jest.useFakeTimers()

    monitor.stop()

    expect(monitor.isRunning).toBe(false)
    expect(clearTimeout).toHaveBeenCalledTimes(1)
    expect(clearTimeout).toHaveBeenLastCalledWith(monitor.timer)
    expect(logger.info.calledOnce).toBe(true)
    expect(logger.info.calledWith('Daily auction monitor stopped')).toBe(true)
  })
})
