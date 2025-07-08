import { Body, Controller, Get, Param, Post, Request, UseGuards, Delete } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Roles } from 'src/roles/roles.decorator';
import { CreateGroupDto } from './dto/create-group.dto';
import { CreateGroupMessageDto } from './dto/create-group-message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagesController {
    constructor(private messagesService: MessagesService) {}

    @Get('private')
    getPrivateMessages(@Request() req) {
        return this.messagesService.getPrivateMessages(
            req.user.id,
            req.user.role
        );
    }

    @Post('private')
    sendPrivateMessage(
        @Body() dto: CreateMessageDto,
        @Request() req
    ) {
        return this.messagesService.sendPrivateMessage(
            dto,
            req.user.id,
            req.user.role
        );
    }

    @Post('group')
    @Roles('teacher')
    createGroup(
        @Body() dto: CreateGroupDto,
        @Request() req
    ) {
        return this.messagesService.createGroup(dto, req.user.id)
    }

    @Post('groups/:groupId/messages')
    sendGroupMessage(
        @Param('groupId') groupId: string,
        @Body() dto: CreateGroupMessageDto,
        @Request() req
    ) {
        const id = parseInt(groupId);
        return this.messagesService.sendGroupMessage(
            id,
            dto,
            req.user.id,
            req.user.role,
        )
    }

    @Get('groups')
    getUserGroups(@Request() req) {
        return this.messagesService.getUserGroups(
            req.user.id,
            req.user.role
        );
    }

    @Get('groups/:groupId/messages')
    getGroupMessages(
        @Param('groupId') groupId: string,
        @Request() req
    ) {
        const id = parseInt(groupId);
        return this.messagesService.getGroupMessages(
            id,
            req.user.id,
            req.user.role
        );
    }

    @Delete('/groups/:groupId')
    async deleteGroupChat(@Param('groupId') groupId: number, @Request() req) {
        const teacherId = req.user.id;
        return this.messagesService.deleteGroupChat(groupId, teacherId);
    }
}
