; READ-ONLY STATIC EVIDENCE. Never executed.
; Input SHA256 06f994965ebde56116d5d53b2e8ffb0c999124166ad99032566cc33d7f83ccdb
; VA addresses, image base 0x400000. Gaps between spans are omitted.
; Disassembly is evidence for branches, not observed screen pixels.

; Span 0x4954e0 <= VA < 0x49551c

/tmp/ra2-engine-reference/game.exe:     file format pei-i386


Disassembly of section .text:

004954e0 <.text+0x944e0>:
  4954e0:	a1 a8 1c 85 00       	mov    eax,ds:0x851ca8
  4954e5:	81 e1 ff ff 00 00    	and    ecx,0xffff
  4954eb:	52                   	push   edx
  4954ec:	51                   	push   ecx
  4954ed:	50                   	push   eax
  4954ee:	ff 15 1c a2 79 00    	call   DWORD PTR ds:0x79a21c ; KERNEL32.dll!FindResourceA
  4954f4:	85 c0                	test   eax,eax
  4954f6:	75 01                	jne    0x4954f9
  4954f8:	c3                   	ret
  4954f9:	8b 0d a8 1c 85 00    	mov    ecx,DWORD PTR ds:0x851ca8
  4954ff:	50                   	push   eax
  495500:	51                   	push   ecx
  495501:	ff 15 20 a2 79 00    	call   DWORD PTR ds:0x79a220 ; KERNEL32.dll!LoadResource
  495507:	85 c0                	test   eax,eax
  495509:	75 01                	jne    0x49550c
  49550b:	c3                   	ret
  49550c:	50                   	push   eax
  49550d:	ff 15 18 a2 79 00    	call   DWORD PTR ds:0x79a218 ; KERNEL32.dll!LockResource
  495513:	c3                   	ret
  495514:	90                   	nop
  495515:	90                   	nop
  495516:	90                   	nop
  495517:	90                   	nop
  495518:	90                   	nop
  495519:	90                   	nop
  49551a:	90                   	nop
  49551b:	90                   	nop

; Span 0x5ff610 <= VA < 0x5ff695

/tmp/ra2-engine-reference/game.exe:     file format pei-i386


Disassembly of section .text:

005ff610 <.text+0x1fe610>:
  5ff610:	83 ec 0c             	sub    esp,0xc
  5ff613:	53                   	push   ebx
  5ff614:	55                   	push   ebp
  5ff615:	56                   	push   esi
  5ff616:	8b f1                	mov    esi,ecx
  5ff618:	8b ee                	mov    ebp,esi
  5ff61a:	89 54 24 0c          	mov    DWORD PTR [esp+0xc],edx
  5ff61e:	81 e5 ff ff 00 00    	and    ebp,0xffff
  5ff624:	57                   	push   edi
  5ff625:	ba 05 00 00 00       	mov    edx,0x5
  5ff62a:	8b cd                	mov    ecx,ebp
  5ff62c:	e8 af 5e e9 ff       	call   0x4954e0
  5ff631:	85 c0                	test   eax,eax
  5ff633:	75 0a                	jne    0x5ff63f
  5ff635:	5f                   	pop    edi
  5ff636:	5e                   	pop    esi
  5ff637:	5d                   	pop    ebp
  5ff638:	5b                   	pop    ebx
  5ff639:	83 c4 0c             	add    esp,0xc
  5ff63c:	c2 04 00             	ret    0x4
  5ff63f:	8b 0d e0 5d b2 00    	mov    ecx,DWORD PTR ds:0xb25de0
  5ff645:	8d 54 24 14          	lea    edx,[esp+0x14]
  5ff649:	52                   	push   edx
  5ff64a:	8b 15 d8 63 b2 00    	mov    edx,DWORD PTR ds:0xb263d8
  5ff650:	8d 3c cd b8 5b b2 00 	lea    edi,[ecx*8+0xb25bb8]
  5ff657:	8d 1c cd bc 5b b2 00 	lea    ebx,[ecx*8+0xb25bbc]
  5ff65e:	41                   	inc    ecx
  5ff65f:	66 89 74 24 18       	mov    WORD PTR [esp+0x18],si
  5ff664:	89 0d e0 5d b2 00    	mov    DWORD PTR ds:0xb25de0,ecx
  5ff66a:	8b 4c 24 24          	mov    ecx,DWORD PTR [esp+0x24]
  5ff66e:	89 4c 24 1c          	mov    DWORD PTR [esp+0x1c],ecx
  5ff672:	8b 4c 24 14          	mov    ecx,DWORD PTR [esp+0x14]
  5ff676:	51                   	push   ecx
  5ff677:	52                   	push   edx
  5ff678:	50                   	push   eax
  5ff679:	a1 80 61 b2 00       	mov    eax,ds:0xb26180
  5ff67e:	c7 07 00 00 00 00    	mov    DWORD PTR [edi],0x0
  5ff684:	50                   	push   eax
  5ff685:	c7 03 00 00 00 00    	mov    DWORD PTR [ebx],0x0
  5ff68b:	ff 15 48 a4 79 00    	call   DWORD PTR ds:0x79a448 ; USER32.dll!CreateDialogIndirectParamA
  5ff691:	8b f0                	mov    esi,eax
  5ff693:	85 f6                	test   esi,esi

; Span 0x5fff3c <= VA < 0x5fff73

/tmp/ra2-engine-reference/game.exe:     file format pei-i386


Disassembly of section .text:

005fff3c <.text+0x1fef3c>:
  5fff3c:	55                   	push   ebp
  5fff3d:	68 20 87 5e 00       	push   0x5e8720
  5fff42:	56                   	push   esi
  5fff43:	ff d7                	call   edi
  5fff45:	8b ce                	mov    ecx,esi
  5fff47:	e8 54 a0 fe ff       	call   0x5e9fa0
  5fff4c:	84 c0                	test   al,al
  5fff4e:	0f 84 c6 00 00 00    	je     0x60001a
  5fff54:	8b 0d 68 dd 7a 00    	mov    ecx,DWORD PTR ds:0x7add68
  5fff5a:	8b 15 74 dd 7a 00    	mov    edx,DWORD PTR ds:0x7add74
  5fff60:	89 4c 24 28          	mov    DWORD PTR [esp+0x28],ecx
  5fff64:	89 54 24 2c          	mov    DWORD PTR [esp+0x2c],edx
  5fff68:	8d 54 24 28          	lea    edx,[esp+0x28]
  5fff6c:	8b ce                	mov    ecx,esi
  5fff6e:	e8 8d 9f fe ff       	call   0x5e9f00

; Span 0x5e9f00 <= VA < 0x5e9f36

/tmp/ra2-engine-reference/game.exe:     file format pei-i386


Disassembly of section .text:

005e9f00 <.text+0x1e8f00>:
  5e9f00:	a1 e4 23 85 00       	mov    eax,ds:0x8523e4
  5e9f05:	56                   	push   esi
  5e9f06:	8b f1                	mov    esi,ecx
  5e9f08:	57                   	push   edi
  5e9f09:	8b 0d e0 23 85 00    	mov    ecx,DWORD PTR ds:0x8523e0
  5e9f0f:	6a 00                	push   0x0
  5e9f11:	50                   	push   eax
  5e9f12:	51                   	push   ecx
  5e9f13:	6a 00                	push   0x0
  5e9f15:	6a 00                	push   0x0
  5e9f17:	8b fa                	mov    edi,edx
  5e9f19:	56                   	push   esi
  5e9f1a:	ff 15 e0 a3 79 00    	call   DWORD PTR ds:0x79a3e0 ; USER32.dll!MoveWindow
  5e9f20:	89 35 cc 63 a7 00    	mov    DWORD PTR ds:0xa763cc,esi
  5e9f26:	57                   	push   edi
  5e9f27:	68 b0 9b 5e 00       	push   0x5e9bb0
  5e9f2c:	56                   	push   esi
  5e9f2d:	ff 15 dc a4 79 00    	call   DWORD PTR ds:0x79a4dc ; USER32.dll!EnumChildWindows
  5e9f33:	5f                   	pop    edi
  5e9f34:	5e                   	pop    esi
  5e9f35:	c3                   	ret

; Span 0x5e9bb0 <= VA < 0x5e9c1a

/tmp/ra2-engine-reference/game.exe:     file format pei-i386


Disassembly of section .text:

005e9bb0 <.text+0x1e8bb0>:
  5e9bb0:	83 ec 34             	sub    esp,0x34
  5e9bb3:	55                   	push   ebp
  5e9bb4:	56                   	push   esi
  5e9bb5:	8b 74 24 40          	mov    esi,DWORD PTR [esp+0x40]
  5e9bb9:	56                   	push   esi
  5e9bba:	ff 15 00 a5 79 00    	call   DWORD PTR ds:0x79a500 ; USER32.dll!GetParent
  5e9bc0:	8b e8                	mov    ebp,eax
  5e9bc2:	a1 cc 63 a7 00       	mov    eax,ds:0xa763cc
  5e9bc7:	3b c5                	cmp    eax,ebp
  5e9bc9:	89 6c 24 08          	mov    DWORD PTR [esp+0x8],ebp
  5e9bcd:	0f 85 1d 03 00 00    	jne    0x5e9ef0
  5e9bd3:	53                   	push   ebx
  5e9bd4:	57                   	push   edi
  5e9bd5:	8d 44 24 14          	lea    eax,[esp+0x14]
  5e9bd9:	33 ff                	xor    edi,edi
  5e9bdb:	50                   	push   eax
  5e9bdc:	8b d6                	mov    edx,esi
  5e9bde:	8b cd                	mov    ecx,ebp
  5e9be0:	89 7c 24 18          	mov    DWORD PTR [esp+0x18],edi
  5e9be4:	89 7c 24 1c          	mov    DWORD PTR [esp+0x1c],edi
  5e9be8:	89 7c 24 20          	mov    DWORD PTR [esp+0x20],edi
  5e9bec:	89 7c 24 24          	mov    DWORD PTR [esp+0x24],edi
  5e9bf0:	e8 5b c8 ff ff       	call   0x5e6450
  5e9bf5:	84 c0                	test   al,al
  5e9bf7:	74 21                	je     0x5e9c1a
  5e9bf9:	8d 54 24 14          	lea    edx,[esp+0x14]
  5e9bfd:	8b ce                	mov    ecx,esi
  5e9bff:	e8 9c ef ff ff       	call   0x5e8ba0
  5e9c04:	8b ce                	mov    ecx,esi
  5e9c06:	e8 05 f8 ff ff       	call   0x5e9410
  5e9c0b:	5f                   	pop    edi
  5e9c0c:	5b                   	pop    ebx
  5e9c0d:	5e                   	pop    esi
  5e9c0e:	b8 01 00 00 00       	mov    eax,0x1
  5e9c13:	5d                   	pop    ebp
  5e9c14:	83 c4 34             	add    esp,0x34
  5e9c17:	c2 08 00             	ret    0x8

; Span 0x5e9e6b <= VA < 0x5e9ee1

/tmp/ra2-engine-reference/game.exe:     file format pei-i386


Disassembly of section .text:

005e9e6b <.text+0x1e8e6b>:
  5e9e6b:	56                   	push   esi
  5e9e6c:	ff 15 00 a5 79 00    	call   DWORD PTR ds:0x79a500 ; USER32.dll!GetParent
  5e9e72:	8b 3d 98 a3 79 00    	mov    edi,DWORD PTR ds:0x79a398 ; USER32.dll!GetWindowRect
  5e9e78:	8d 54 24 34          	lea    edx,[esp+0x34]
  5e9e7c:	52                   	push   edx
  5e9e7d:	50                   	push   eax
  5e9e7e:	ff d7                	call   edi
  5e9e80:	8d 44 24 24          	lea    eax,[esp+0x24]
  5e9e84:	50                   	push   eax
  5e9e85:	56                   	push   esi
  5e9e86:	ff d7                	call   edi
  5e9e88:	6a 00                	push   0x0
  5e9e8a:	8b 6c 24 3c          	mov    ebp,DWORD PTR [esp+0x3c]
  5e9e8e:	8b 54 24 34          	mov    edx,DWORD PTR [esp+0x34]
  5e9e92:	8b 4c 24 2c          	mov    ecx,DWORD PTR [esp+0x2c]
  5e9e96:	8b 44 24 30          	mov    eax,DWORD PTR [esp+0x30]
  5e9e9a:	8b 7c 24 28          	mov    edi,DWORD PTR [esp+0x28]
  5e9e9e:	8b 5c 24 50          	mov    ebx,DWORD PTR [esp+0x50]
  5e9ea2:	2b d1                	sub    edx,ecx
  5e9ea4:	2b c7                	sub    eax,edi
  5e9ea6:	52                   	push   edx
  5e9ea7:	8b 53 04             	mov    edx,DWORD PTR [ebx+0x4]
  5e9eaa:	50                   	push   eax
  5e9eab:	a1 e4 23 85 00       	mov    eax,ds:0x8523e4
  5e9eb0:	2b c2                	sub    eax,edx
  5e9eb2:	99                   	cdq
  5e9eb3:	2b c2                	sub    eax,edx
  5e9eb5:	8b 13                	mov    edx,DWORD PTR [ebx]
  5e9eb7:	d1 f8                	sar    eax,1
  5e9eb9:	2b c5                	sub    eax,ebp
  5e9ebb:	8b 5c 24 40          	mov    ebx,DWORD PTR [esp+0x40]
  5e9ebf:	03 c1                	add    eax,ecx
  5e9ec1:	50                   	push   eax
  5e9ec2:	a1 e0 23 85 00       	mov    eax,ds:0x8523e0
  5e9ec7:	2b c2                	sub    eax,edx
  5e9ec9:	99                   	cdq
  5e9eca:	2b c2                	sub    eax,edx
  5e9ecc:	d1 f8                	sar    eax,1
  5e9ece:	2b c3                	sub    eax,ebx
  5e9ed0:	03 c7                	add    eax,edi
  5e9ed2:	50                   	push   eax
  5e9ed3:	56                   	push   esi
  5e9ed4:	ff 15 e0 a3 79 00    	call   DWORD PTR ds:0x79a3e0 ; USER32.dll!MoveWindow
  5e9eda:	8b ce                	mov    ecx,esi
  5e9edc:	e8 2f f5 ff ff       	call   0x5e9410
