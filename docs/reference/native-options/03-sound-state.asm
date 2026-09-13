; READ-ONLY STATIC EVIDENCE. Never executed.
; Input SHA256 06f994965ebde56116d5d53b2e8ffb0c999124166ad99032566cc33d7f83ccdb
; VA addresses, image base 0x400000. Gaps between spans are omitted.
; Disassembly is evidence for branches, not observed screen pixels.

; Span 0x688dfa <= VA < 0x688f25

/tmp/ra2-engine-reference/game.exe:     file format pei-i386


Disassembly of section .text:

00688dfa <.text+0x287dfa>:
  688dfa:	a2 b0 cf ab 00       	mov    ds:0xabcfb0,al
  688dff:	e8 2c e1 d7 ff       	call   0x406f30
  688e04:	8b d8                	mov    ebx,eax
  688e06:	68 2f 05 00 00       	push   0x52f
  688e0b:	57                   	push   edi
  688e0c:	89 5c 24 18          	mov    DWORD PTR [esp+0x18],ebx
  688e10:	ff 15 9c a4 79 00    	call   DWORD PTR ds:0x79a49c ; USER32.dll!GetDlgItem
  688e16:	8b 35 a0 a4 79 00    	mov    esi,DWORD PTR ds:0x79a4a0 ; USER32.dll!SendMessageA
  688e1c:	8b f8                	mov    edi,eax
  688e1e:	85 ff                	test   edi,edi
  688e20:	74 49                	je     0x688e6b
  688e22:	6a 00                	push   0x0
  688e24:	6a 00                	push   0x0
  688e26:	68 ae 04 00 00       	push   0x4ae
  688e2b:	57                   	push   edi
  688e2c:	ff d6                	call   esi
  688e2e:	68 00 00 0a 00       	push   0xa0000
  688e33:	6a 01                	push   0x1
  688e35:	68 06 04 00 00       	push   0x406
  688e3a:	57                   	push   edi
  688e3b:	ff d6                	call   esi
  688e3d:	d9 05 4c 0b a4 00    	fld    DWORD PTR ds:0xa40b4c
  688e43:	dc 0d 30 d1 79 00    	fmul   QWORD PTR ds:0x79d130
  688e49:	dc 05 28 a7 79 00    	fadd   QWORD PTR ds:0x79a728
  688e4f:	e8 bc 62 0f 00       	call   0x77f110
  688e54:	50                   	push   eax
  688e55:	6a 01                	push   0x1
  688e57:	68 05 04 00 00       	push   0x405
  688e5c:	57                   	push   edi
  688e5d:	ff d6                	call   esi
  688e5f:	8b 2d 90 a4 79 00    	mov    ebp,DWORD PTR ds:0x79a490 ; USER32.dll!EnableWindow
  688e65:	53                   	push   ebx
  688e66:	57                   	push   edi
  688e67:	ff d5                	call   ebp
  688e69:	eb 06                	jmp    0x688e71
  688e6b:	8b 2d 90 a4 79 00    	mov    ebp,DWORD PTR ds:0x79a490 ; USER32.dll!EnableWindow
  688e71:	8b 84 24 ec 00 00 00 	mov    eax,DWORD PTR [esp+0xec]
  688e78:	68 32 05 00 00       	push   0x532
  688e7d:	50                   	push   eax
  688e7e:	ff 15 9c a4 79 00    	call   DWORD PTR ds:0x79a49c ; USER32.dll!GetDlgItem
  688e84:	8b f8                	mov    edi,eax
  688e86:	85 ff                	test   edi,edi
  688e88:	74 41                	je     0x688ecb
  688e8a:	6a 00                	push   0x0
  688e8c:	6a 00                	push   0x0
  688e8e:	68 ae 04 00 00       	push   0x4ae
  688e93:	57                   	push   edi
  688e94:	ff d6                	call   esi
  688e96:	68 00 00 0a 00       	push   0xa0000
  688e9b:	6a 01                	push   0x1
  688e9d:	68 06 04 00 00       	push   0x406
  688ea2:	57                   	push   edi
  688ea3:	ff d6                	call   esi
  688ea5:	d9 05 44 0b a4 00    	fld    DWORD PTR ds:0xa40b44
  688eab:	dc 0d 30 d1 79 00    	fmul   QWORD PTR ds:0x79d130
  688eb1:	dc 05 28 a7 79 00    	fadd   QWORD PTR ds:0x79a728
  688eb7:	e8 54 62 0f 00       	call   0x77f110
  688ebc:	50                   	push   eax
  688ebd:	6a 01                	push   0x1
  688ebf:	68 05 04 00 00       	push   0x405
  688ec4:	57                   	push   edi
  688ec5:	ff d6                	call   esi
  688ec7:	53                   	push   ebx
  688ec8:	57                   	push   edi
  688ec9:	ff d5                	call   ebp
  688ecb:	8b 8c 24 ec 00 00 00 	mov    ecx,DWORD PTR [esp+0xec]
  688ed2:	68 36 05 00 00       	push   0x536
  688ed7:	51                   	push   ecx
  688ed8:	ff 15 9c a4 79 00    	call   DWORD PTR ds:0x79a49c ; USER32.dll!GetDlgItem
  688ede:	8b f8                	mov    edi,eax
  688ee0:	85 ff                	test   edi,edi
  688ee2:	74 41                	je     0x688f25
  688ee4:	6a 00                	push   0x0
  688ee6:	6a 00                	push   0x0
  688ee8:	68 ae 04 00 00       	push   0x4ae
  688eed:	57                   	push   edi
  688eee:	ff d6                	call   esi
  688ef0:	68 00 00 0a 00       	push   0xa0000
  688ef5:	6a 01                	push   0x1
  688ef7:	68 06 04 00 00       	push   0x406
  688efc:	57                   	push   edi
  688efd:	ff d6                	call   esi
  688eff:	d9 05 48 0b a4 00    	fld    DWORD PTR ds:0xa40b48
  688f05:	dc 0d 30 d1 79 00    	fmul   QWORD PTR ds:0x79d130
  688f0b:	dc 05 28 a7 79 00    	fadd   QWORD PTR ds:0x79a728
  688f11:	e8 fa 61 0f 00       	call   0x77f110
  688f16:	50                   	push   eax
  688f17:	6a 01                	push   0x1
  688f19:	68 05 04 00 00       	push   0x405
  688f1e:	57                   	push   edi
  688f1f:	ff d6                	call   esi
  688f21:	53                   	push   ebx
  688f22:	57                   	push   edi
  688f23:	ff d5                	call   ebp

; Span 0x688f25 <= VA < 0x688fb8

/tmp/ra2-engine-reference/game.exe:     file format pei-i386


Disassembly of section .text:

00688f25 <.text+0x287f25>:
  688f25:	a0 58 09 a4 00       	mov    al,ds:0xa40958
  688f2a:	84 c0                	test   al,al
  688f2c:	0f 84 87 01 00 00    	je     0x6890b9
  688f32:	8b 94 24 ec 00 00 00 	mov    edx,DWORD PTR [esp+0xec]
  688f39:	68 33 05 00 00       	push   0x533
  688f3e:	52                   	push   edx
  688f3f:	ff 15 9c a4 79 00    	call   DWORD PTR ds:0x79a49c ; USER32.dll!GetDlgItem
  688f45:	8b f8                	mov    edi,eax
  688f47:	85 ff                	test   edi,edi
  688f49:	74 1c                	je     0x688f67
  688f4b:	8a 15 52 0b a4 00    	mov    dl,BYTE PTR ds:0xa40b52
  688f51:	33 c0                	xor    eax,eax
  688f53:	84 d2                	test   dl,dl
  688f55:	0f 95 c0             	setne  al
  688f58:	6a 00                	push   0x0
  688f5a:	50                   	push   eax
  688f5b:	68 f1 00 00 00       	push   0xf1
  688f60:	57                   	push   edi
  688f61:	ff d6                	call   esi
  688f63:	53                   	push   ebx
  688f64:	57                   	push   edi
  688f65:	ff d5                	call   ebp
  688f67:	8b 8c 24 ec 00 00 00 	mov    ecx,DWORD PTR [esp+0xec]
  688f6e:	68 34 05 00 00       	push   0x534
  688f73:	51                   	push   ecx
  688f74:	ff 15 9c a4 79 00    	call   DWORD PTR ds:0x79a49c ; USER32.dll!GetDlgItem
  688f7a:	8b f8                	mov    edi,eax
  688f7c:	85 ff                	test   edi,edi
  688f7e:	74 1b                	je     0x688f9b
  688f80:	a0 50 0b a4 00       	mov    al,ds:0xa40b50
  688f85:	33 d2                	xor    edx,edx
  688f87:	84 c0                	test   al,al
  688f89:	0f 95 c2             	setne  dl
  688f8c:	6a 00                	push   0x0
  688f8e:	52                   	push   edx
  688f8f:	68 f1 00 00 00       	push   0xf1
  688f94:	57                   	push   edi
  688f95:	ff d6                	call   esi
  688f97:	53                   	push   ebx
  688f98:	57                   	push   edi
  688f99:	ff d5                	call   ebp
  688f9b:	8b 84 24 ec 00 00 00 	mov    eax,DWORD PTR [esp+0xec]
  688fa2:	68 30 05 00 00       	push   0x530
  688fa7:	50                   	push   eax
  688fa8:	ff 15 9c a4 79 00    	call   DWORD PTR ds:0x79a49c ; USER32.dll!GetDlgItem
  688fae:	8b d8                	mov    ebx,eax
  688fb0:	85 db                	test   ebx,ebx
  688fb2:	0f 84 01 01 00 00    	je     0x6890b9

; Span 0x689093 <= VA < 0x6890b9

/tmp/ra2-engine-reference/game.exe:     file format pei-i386


Disassembly of section .text:

00689093 <.text+0x288093>:
  689093:	8b 7c 24 14          	mov    edi,DWORD PTR [esp+0x14]
  689097:	6a 00                	push   0x0
  689099:	57                   	push   edi
  68909a:	68 86 01 00 00       	push   0x186
  68909f:	53                   	push   ebx
  6890a0:	ff d6                	call   esi
  6890a2:	6a 00                	push   0x0
  6890a4:	57                   	push   edi
  6890a5:	68 97 01 00 00       	push   0x197
  6890aa:	53                   	push   ebx
  6890ab:	ff d6                	call   esi
  6890ad:	8b 4c 24 10          	mov    ecx,DWORD PTR [esp+0x10]
  6890b1:	51                   	push   ecx
  6890b2:	53                   	push   ebx
  6890b3:	ff 15 90 a4 79 00    	call   DWORD PTR ds:0x79a490 ; USER32.dll!EnableWindow
