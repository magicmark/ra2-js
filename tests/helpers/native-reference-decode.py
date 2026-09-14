#!/usr/bin/env python3
"""Independent acceptance decoder, deliberately separate from the TS codec.

Terrain uses the system liblzo2 implementation. Format80 opcode meanings and
4-byte chunk framing were checked against OpenRA's LCWCompression.cs and
ImportGen2MapCommand.cs. No original game data is stored by this helper.
Input: a native map on stdin. Output: decoded packed sections as base64 JSON.
Requires Python 3 and liblzo2 (only the opt-in original-archive test uses it).
"""
import base64
import configparser
import ctypes
import ctypes.util
import io
import json
import struct
import sys


def lcw(source, expected):
    stream = io.BytesIO(source)
    output = bytearray()

    def take(n):
        value = stream.read(n)
        assert len(value) == n, 'truncated LCW'
        return value

    def word():
        return int.from_bytes(take(2), 'little')

    while True:
        opcode = take(1)[0]
        if opcode == 128:
            break
        if 128 < opcode < 192:
            output.extend(take(opcode - 128))
        elif opcode == 254:
            count = word()
            output.extend(take(1) * count)
        else:
            if opcode < 128:
                count = 3 + (opcode >> 4)
                position = len(output) - ((opcode % 16) * 256 + take(1)[0])
            else:
                count = word() if opcode == 255 else opcode - 189
                position = word()
            assert 0 <= position < len(output), 'invalid LCW back-reference'
            for _ in range(count):
                output.append(output[position])
                position += 1
        assert len(output) <= expected, 'LCW output overflow'
    assert len(output) == expected, (len(output), expected)
    return bytes(output)


def decode_map(text):
    ini = configparser.ConfigParser(interpolation=None, strict=False)
    ini.read_string(text)
    library = ctypes.CDLL(ctypes.util.find_library('lzo2') or 'liblzo2.so.2')
    decompress = library.lzo1x_decompress_safe
    decompress.argtypes = [ctypes.c_void_p, ctypes.c_size_t, ctypes.c_void_p,
                           ctypes.POINTER(ctypes.c_size_t), ctypes.c_void_p]
    result = {}
    for section in ['IsoMapPack5', 'OverlayPack', 'OverlayDataPack']:
        encoded = ''.join(v for k, v in sorted(ini[section].items(), key=lambda item: int(item[0])))
        packed = base64.b64decode(encoded)
        offset = 0
        decoded = bytearray()
        blocks = 0
        while offset < len(packed):
            size, expected = struct.unpack_from('<HH', packed, offset)
            offset += 4
            if size == expected == 0:
                assert offset == len(packed)
                break
            chunk = packed[offset:offset + size]
            assert len(chunk) == size and expected > 0
            offset += size
            if section == 'IsoMapPack5':
                target = ctypes.create_string_buffer(expected)
                length = ctypes.c_size_t(expected)
                status = decompress(chunk, len(chunk), target, ctypes.byref(length), None)
                assert status == 0 and length.value == expected, (status, length.value, expected)
                output = target.raw
            else:
                output = lcw(chunk, expected)
            decoded.extend(output)
            blocks += 1
        result[section] = {'data': base64.b64encode(decoded).decode(), 'blocks': blocks}
    return result


if __name__ == '__main__':
    print(json.dumps(decode_map(sys.stdin.read())))
